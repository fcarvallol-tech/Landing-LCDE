-- ═══════════════════════════════════════════════════════════════════════════
--  La Casa del Estratega — 002: funciones de stock y confirmación de pago
--
--  Corre este archivo DESPUÉS de 001_esquema.sql.
--
--  Toda la lógica delicada (descontar stock, marcar pagado) vive acá dentro,
--  en una sola transacción de Postgres. Así dos compras simultáneas no pueden
--  vender la misma última unidad, y un webhook repetido no descuenta dos veces.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Descuento atómico de una unidad de stock ───────────────────────────────
-- Condicional en el propio UPDATE: si no hay suficiente, no actualiza nada y
-- devuelve false. Nunca "leer y después escribir" desde Node.
create or replace function public.descontar_stock(
  p_producto_id text,
  p_cantidad    integer
)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  filas integer;
begin
  update public.productos
     set stock = stock - p_cantidad
   where id = p_producto_id
     and stock >= p_cantidad;

  get diagnostics filas = row_count;
  return filas = 1;
end;
$$;

comment on function public.descontar_stock is
  'Descuenta stock solo si alcanza. Devuelve false si no alcanzaba.';


-- ── Confirmación de pago: idempotente, atómica y con control de monto ──────
--
-- Devuelve uno de estos resultados:
--   'ya_procesado'        el pedido ya estaba pagado (webhook repetido)
--   'pagado'              todo bien: pedido pagado y stock descontado
--   'pagado_sin_stock'    el pago entró pero ya no había stock
--   'monto_no_coincide'   lo pagado no calza con el pedido -> queda en revisión
--   'pedido_no_encontrado'
--   'pago_de_otro_pedido' ese payment_id ya está asociado a otro pedido
create or replace function public.confirmar_pago(
  p_pedido_id  uuid,
  p_payment_id text,
  p_monto      integer
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_pedido        public.pedidos%rowtype;
  v_item          record;
  v_ok            boolean;
  v_todo_ok       boolean := true;
  v_dueno_actual  uuid;
begin
  -- 1. Tomar el pedido y bloquear la fila hasta el fin de la transacción.
  select * into v_pedido
    from public.pedidos
   where id = p_pedido_id
     for update;

  if not found then
    return 'pedido_no_encontrado';
  end if;

  -- 2. Idempotencia. Si el pago ya se procesó, no hacemos nada más.
  if v_pedido.mp_payment_id is not null then
    if v_pedido.mp_payment_id = p_payment_id then
      return 'ya_procesado';
    end if;
  end if;

  if v_pedido.estado in ('pagado', 'pagado_sin_stock', 'entregado') then
    return 'ya_procesado';
  end if;

  -- 3. ¿Ese payment_id ya está usado por otro pedido? Señal de algo raro.
  select id into v_dueno_actual
    from public.pedidos
   where mp_payment_id = p_payment_id
     and id <> p_pedido_id
   limit 1;

  if v_dueno_actual is not null then
    return 'pago_de_otro_pedido';
  end if;

  -- 4. El monto pagado tiene que calzar con el monto del pedido.
  --    Si no calza, NO se marca pagado: queda para revisión manual.
  if p_monto is distinct from v_pedido.total then
    update public.pedidos
       set estado = 'revisar',
           mp_payment_id = p_payment_id,
           notas_internas = coalesce(notas_internas || E'\n', '') ||
             format('Monto pagado %s no coincide con el total del pedido %s (%s).',
                    p_monto, v_pedido.total, now()::text)
     where id = p_pedido_id;
    return 'monto_no_coincide';
  end if;

  -- 5. Descontar el stock de cada ítem. Se ordena por producto_id para que dos
  --    transacciones simultáneas tomen los bloqueos en el mismo orden y no se
  --    puedan trabar entre ellas.
  for v_item in
    select producto_id, sum(cantidad)::integer as cantidad
      from public.pedido_items
     where pedido_id = p_pedido_id
     group by producto_id
     order by producto_id
  loop
    v_ok := public.descontar_stock(v_item.producto_id, v_item.cantidad);
    if not v_ok then
      v_todo_ok := false;
      exit;
    end if;
  end loop;

  -- 6. Si a algo no le alcanzó el stock, se deshace TODO el descuento y el
  --    pedido queda marcado para que Felipe contacte al comprador.
  if not v_todo_ok then
    raise exception using
      errcode = 'P0001',
      message = 'sin_stock';
  end if;

  update public.pedidos
     set estado = 'pagado',
         mp_payment_id = p_payment_id,
         pagado_en = now()
   where id = p_pedido_id;

  return 'pagado';

exception
  when sqlstate 'P0001' then
    -- El rollback del bloque revierte los descuentos parciales de stock.
    -- Registramos el pedido igual: nunca se pierde una venta en silencio.
    update public.pedidos
       set estado = 'pagado_sin_stock',
           mp_payment_id = p_payment_id,
           pagado_en = now(),
           notas_internas = coalesce(notas_internas || E'\n', '') ||
             format('Pago recibido pero sin stock suficiente (%s). Contactar al comprador.',
                    now()::text)
     where id = p_pedido_id;
    return 'pagado_sin_stock';
end;
$$;

comment on function public.confirmar_pago is
  'Marca un pedido como pagado y descuenta stock en una sola transacción. Idempotente.';


-- ── Devolver stock (por si Felipe cancela un pedido ya pagado) ─────────────
create or replace function public.devolver_stock(p_pedido_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_item record;
begin
  for v_item in
    select producto_id, sum(cantidad)::integer as cantidad
      from public.pedido_items
     where pedido_id = p_pedido_id
     group by producto_id
     order by producto_id
  loop
    update public.productos
       set stock = stock + v_item.cantidad
     where id = v_item.producto_id;
  end loop;
end;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
--  La Casa del Estratega — 001: esquema base
--
--  Cómo correr esto:
--    Supabase > tu proyecto > SQL Editor > New query > pegar todo > Run.
--    Corre los archivos en orden: 001, luego 002, luego 003.
--
--  Este archivo se puede volver a correr sin romper nada (es idempotente).
-- ═══════════════════════════════════════════════════════════════════════════

-- gen_random_uuid() vive acá.
create extension if not exists pgcrypto;

-- ── productos ──────────────────────────────────────────────────────────────
-- El precio de referencia también vive en el código (src/lib/catalogo.ts), que
-- es la fuente de verdad para cobrar. Esta tabla existe sobre todo para el
-- STOCK, que Felipe edita desde el panel sin tocar código.
create table if not exists public.productos (
  id              text primary key,
  nombre          text        not null,
  precio          integer     not null check (precio >= 0),
  stock           integer     not null default 0 check (stock >= 0),
  activo          boolean     not null default true,
  orden           integer     not null default 0,
  actualizado_en  timestamptz not null default now()
);

comment on table public.productos is
  'Los 5 SKUs. El stock se edita desde el panel de administración.';
comment on column public.productos.stock is
  'Unidades disponibles. Se descuenta solo cuando el pago queda confirmado.';

-- ── pedidos ────────────────────────────────────────────────────────────────
create table if not exists public.pedidos (
  id                 uuid        primary key default gen_random_uuid(),
  numero             bigserial   not null,
  estado             text        not null default 'pendiente',
  nombre             text        not null,
  email              text        not null,
  telefono           text        not null,
  comuna             text        not null,
  direccion          text        not null,
  depto              text,
  referencia         text,
  horario_preferido  text,
  es_regalo          boolean     not null default false,
  mensaje_regalo     text,
  subtotal           integer     not null check (subtotal >= 0),
  costo_envio        integer     not null check (costo_envio >= 0),
  total              integer     not null check (total >= 0),
  mp_preference_id   text,
  mp_payment_id      text,
  acepta_terminos    boolean     not null,
  acepta_marketing   boolean     not null default false,
  creado_en          timestamptz not null default now(),
  pagado_en          timestamptz,
  entregado_en       timestamptz,
  notas_internas     text
);

-- Estados posibles. 'revisar' se usa cuando el monto pagado no coincide con el
-- monto del pedido (docs/06-seguridad.md §2): nunca se marca pagado a ciegas.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pedidos_estado_valido'
  ) then
    alter table public.pedidos add constraint pedidos_estado_valido
      check (estado in (
        'pendiente',
        'pagado',
        'pagado_sin_stock',
        'revisar',
        'entregado',
        'cancelado',
        'rechazado'
      ));
  end if;
end $$;

-- Idempotencia del webhook: un payment_id solo puede aparecer una vez.
create unique index if not exists pedidos_mp_payment_id_unico
  on public.pedidos (mp_payment_id)
  where mp_payment_id is not null;

create unique index if not exists pedidos_numero_unico on public.pedidos (numero);

create index if not exists pedidos_estado_idx     on public.pedidos (estado);
create index if not exists pedidos_comuna_idx     on public.pedidos (comuna);
create index if not exists pedidos_creado_en_idx  on public.pedidos (creado_en desc);

comment on column public.pedidos.numero is
  'Número corto y legible para Felipe. El id uuid es el que usa el sistema.';
comment on column public.pedidos.mp_payment_id is
  'Único: es la garantía de que un pago no se procesa dos veces.';

-- ── pedido_items ───────────────────────────────────────────────────────────
-- Guarda una FOTO del producto al momento de comprar: si mañana sube el precio,
-- el histórico de lo ya vendido no cambia.
create table if not exists public.pedido_items (
  id           uuid    primary key default gen_random_uuid(),
  pedido_id    uuid    not null references public.pedidos(id) on delete cascade,
  producto_id  text    not null,
  nombre       text    not null,
  precio_unit  integer not null check (precio_unit >= 0),
  cantidad     integer not null check (cantidad > 0)
);

create index if not exists pedido_items_pedido_id_idx
  on public.pedido_items (pedido_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
-- RLS activado en las tres tablas y SIN NINGUNA POLÍTICA.
-- Sin políticas, nadie con la clave anónima puede leer ni escribir nada.
-- Todo el acceso ocurre desde el servidor con la service_role key, que salta
-- RLS por diseño. Es exactamente lo que pide docs/06-seguridad.md.
alter table public.productos     enable row level security;
alter table public.pedidos       enable row level security;
alter table public.pedido_items  enable row level security;

-- Por si alguien corrió una versión anterior con políticas abiertas:
do $$
declare pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('productos', 'pedidos', 'pedido_items')
  loop
    execute format('drop policy %I on %I.%I',
                   pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- ── actualizado_en automático en productos ─────────────────────────────────
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists productos_actualizado_en on public.productos;
create trigger productos_actualizado_en
  before update on public.productos
  for each row execute function public.tocar_actualizado_en();

-- ═══════════════════════════════════════════════════════════════════════════
--  La Casa del Estratega — 004: campaña de origen del pedido
--
--  Agrega la columna `campana` a `pedidos`: el ángulo del anuncio con que
--  llegó la persona (el parámetro ?c= de la URL, docs/12-rediseno.md §6).
--  Sirve para saber después qué ángulo trajo compras.
--
--  Cómo correr esto:
--    Supabase > tu proyecto > SQL Editor > New query > pegar todo > Run.
--    Va después de 001, 002 y 003.
--
--  Se puede volver a correr sin romper nada (es idempotente). No toca ninguna
--  fila existente: los pedidos antiguos quedan con campana = null.
-- ═══════════════════════════════════════════════════════════════════════════

alter table public.pedidos
  add column if not exists campana text;

-- Mismos valores que acepta el servidor (src/lib/campanas.ts). Si algún día
-- se agrega un ángulo nuevo, hay que sumarlo en los dos lugares.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pedidos_campana_valida'
  ) then
    alter table public.pedidos add constraint pedidos_campana_valida
      check (campana is null or campana in ('pantalla', 'juntos', 'pensar', 'practico'));
  end if;
end $$;

comment on column public.pedidos.campana is
  'Ángulo del anuncio con que llegó (?c=): pantalla, juntos, pensar o practico. Null si no vino de un anuncio.';

-- Para que PostgREST (la API que usa el sitio) vea la columna nueva al tiro.
notify pgrst, 'reload schema';

-- ── Para mirar qué ángulo vende ────────────────────────────────────────────
-- Copia esto en una consulta nueva cuando quieras ver los números:
--
--   select coalesce(campana, '(sin anuncio)') as campana,
--          count(*)                           as pedidos_pagados,
--          sum(total)                         as total_vendido
--   from public.pedidos
--   where estado in ('pagado', 'entregado')
--   group by 1
--   order by 2 desc;

-- ═══════════════════════════════════════════════════════════════════════════
--  La Casa del Estratega — 003: carga inicial de los 5 productos
--
--  Corre este archivo DESPUÉS de 001 y 002.
--
--  ⚠ EL STOCK DE ACÁ ES PROVISORIO. Son números de partida para que la página
--    funcione desde el primer minuto. Felipe tiene que contar el inventario
--    real y corregirlo desde el panel (/admin/pedidos), sin tocar código.
--
--  Este archivo se puede volver a correr: actualiza nombres y precios, pero
--  NUNCA pisa el stock que ya hayas ajustado desde el panel.
-- ═══════════════════════════════════════════════════════════════════════════

insert into public.productos (id, nombre, precio, stock, activo, orden) values
  ('tradicional', 'Pack Tradicional',                15990, 20, true, 1),
  ('cm',          'Pack CM · Candidato a Maestro',   29990, 15, true, 2),
  ('im',          'Pack IM · Maestro Internacional', 39990, 10, true, 3),
  ('gm',          'Pack GM · Gran Maestro',          49990,  6, true, 4),
  ('reloj',       'Reloj de ajedrez',                24990, 12, true, 5)
on conflict (id) do update
  set nombre = excluded.nombre,
      precio = excluded.precio,
      orden  = excluded.orden;
      -- stock y activo NO se tocan: son de Felipe.

-- Comprobación rápida: deberías ver 5 filas.
-- select id, nombre, precio, stock, activo from public.productos order by orden;

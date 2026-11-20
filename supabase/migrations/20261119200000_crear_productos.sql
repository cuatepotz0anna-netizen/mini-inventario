create table public.productos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  nombre text not null constraint productos_nombre_contenido
    check (nombre ~ '[^[:space:]]'),
  sku text not null constraint productos_sku_contenido
    check (sku ~ '[^[:space:]]'),
  cantidad integer not null constraint productos_cantidad_no_negativa
    check (cantidad >= 0),
  minimo integer not null constraint productos_minimo_no_negativo
    check (minimo >= 0),
  created_at timestamptz not null default now()
);

create unique index productos_user_id_sku_normalizado_idx
  on public.productos (user_id, lower(btrim(sku)));

alter table public.productos enable row level security;

revoke all privileges on table public.productos from public, anon, authenticated;
grant select, insert, update, delete on table public.productos to authenticated;

create policy productos_select_propios
  on public.productos for select to authenticated
  using ((select auth.uid()) = user_id);

create policy productos_insert_propios
  on public.productos for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy productos_update_propios
  on public.productos for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy productos_delete_propios
  on public.productos for delete to authenticated
  using ((select auth.uid()) = user_id);

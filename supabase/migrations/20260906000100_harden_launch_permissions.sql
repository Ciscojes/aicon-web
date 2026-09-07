begin;

-- PostgreSQL concede EXECUTE a PUBLIC al crear funciones. Estas funciones son
-- internas y deben quedar disponibles únicamente mediante sus disparadores o
-- para usuarios autenticados con los permisos que validan sus cuerpos y RLS.
revoke all on function public.validate_house_unit_catalog_state() from public;
revoke all on function public.set_catalog_media_cover(text, uuid, uuid) from public;
grant execute on function public.set_catalog_media_cover(text, uuid, uuid) to authenticated;

commit;

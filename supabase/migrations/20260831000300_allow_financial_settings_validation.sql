begin;

grant execute on function public.is_valid_financial_settings(jsonb) to authenticated;

commit;

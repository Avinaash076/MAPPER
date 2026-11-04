-- Counters contain no prompts, routes, photos, or coordinates. Clients cannot change quotas.
create table public.travel_service_usage (
  usage_day date not null,
  scope text not null,
  action text not null check (action in ('search','route','weather','assistant')),
  requests integer not null check (requests >= 0),
  primary key (usage_day, scope, action)
);
alter table public.travel_service_usage enable row level security;
revoke all on public.travel_service_usage from public, anon, authenticated;
grant all on public.travel_service_usage to service_role;

create function public.consume_travel_quota(account_id uuid, service_action text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  per_user integer;
  global_limit integer;
  current_count integer;
  quota_day date := (now() at time zone 'UTC')::date;
begin
  if account_id is null or service_action not in ('search','route','weather','assistant') then
    raise exception 'Invalid quota request';
  end if;
  per_user := case service_action when 'assistant' then 20 when 'search' then 100 else 40 end;
  global_limit := case service_action when 'assistant' then 100 else 1000 end;
  -- Lock global first, then user, consistently. No race between concurrent function instances.
  insert into public.travel_service_usage values (quota_day,'global',service_action,0)
    on conflict do nothing;
  select requests into current_count from public.travel_service_usage
    where usage_day=quota_day and scope='global' and action=service_action for update;
  if current_count >= global_limit then return false; end if;
  insert into public.travel_service_usage values (quota_day,account_id::text,service_action,0)
    on conflict do nothing;
  select requests into current_count from public.travel_service_usage
    where usage_day=quota_day and scope=account_id::text and action=service_action for update;
  if current_count >= per_user then return false; end if;
  update public.travel_service_usage set requests=requests+1
    where usage_day=quota_day and action=service_action and scope in ('global',account_id::text);
  return true;
end; $$;
revoke all on function public.consume_travel_quota(uuid,text) from public, anon, authenticated;
grant execute on function public.consume_travel_quota(uuid,text) to service_role;

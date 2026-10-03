create policy swat_pages_questions_read on public.swat_questions for select to anon using (encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers', true),'')::jsonb->>'x-swat-access',''), 'UTF8')), 'hex') = '4254ea60c43054520c3050aa532e496c22356cf90269a5bc1e7fcb6c44a3a4be');
create policy swat_pages_exams_read on public.swat_exams for select to anon using (encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers', true),'')::jsonb->>'x-swat-access',''), 'UTF8')), 'hex') = '4254ea60c43054520c3050aa532e496c22356cf90269a5bc1e7fcb6c44a3a4be');
create policy swat_pages_exams_insert on public.swat_exams for insert to anon with check (encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers', true),'')::jsonb->>'x-swat-access',''), 'UTF8')), 'hex') = '4254ea60c43054520c3050aa532e496c22356cf90269a5bc1e7fcb6c44a3a4be');
create policy swat_pages_exams_update on public.swat_exams for update to anon using (encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers', true),'')::jsonb->>'x-swat-access',''), 'UTF8')), 'hex') = '4254ea60c43054520c3050aa532e496c22356cf90269a5bc1e7fcb6c44a3a4be') with check (encode(sha256(convert_to(coalesce(nullif(current_setting('request.headers', true),'')::jsonb->>'x-swat-access',''), 'UTF8')), 'hex') = '4254ea60c43054520c3050aa532e496c22356cf90269a5bc1e7fcb6c44a3a4be');
create schema if not exists swat_internal;
revoke all on schema swat_internal from public, anon, authenticated;
create function swat_internal.validate_exam() returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare k text; v jsonb; count_scores integer := 0; score_sum integer := 0;
begin
 if TG_OP = 'UPDATE' then
  if OLD.status = 'completed' then raise exception 'Abgeschlossene Prüfung ist schreibgeschützt'; end if;
  NEW.id := OLD.id; NEW.created_at := OLD.created_at; NEW.revision := OLD.revision + 1;
 else NEW.revision := 0; NEW.created_at := now(); end if;
 if length(trim(NEW.candidate))=0 or length(trim(NEW.examiner))=0 then raise exception 'Prüfling und Prüfer erforderlich'; end if;
 if jsonb_typeof(NEW.scores) <> 'object' or jsonb_typeof(NEW.notes) <> 'object' then raise exception 'Ungültige Bewertungen'; end if;
 for k,v in select * from jsonb_each(NEW.scores) loop
  if k !~ '^([1-9]|[1-4][0-9]|5[0-5])$' or jsonb_typeof(v) <> 'number' or v::text !~ '^[0-3]$' then raise exception 'Ungültiger Punktewert'; end if;
  count_scores:=count_scores+1; score_sum:=score_sum+(v::text)::integer;
 end loop;
 for k,v in select * from jsonb_each(NEW.notes) loop
  if k !~ '^([1-9]|[1-4][0-9]|5[0-5])$' or jsonb_typeof(v) <> 'string' or length(v #>> '{}') > 4000 then raise exception 'Ungültige Notiz'; end if;
 end loop;
 if length(NEW.general_note)>10000 then raise exception 'Notiz zu lang'; end if;
 if NEW.status='completed' and count_scores<>55 then raise exception 'Alle 55 Fragen bewerten'; end if;
 NEW.total := score_sum; NEW.passed := case when NEW.status='completed' then score_sum>=132 else null end;
 NEW.updated_at := now();
 return NEW;
end;
$$;
revoke all on function swat_internal.validate_exam() from public,anon,authenticated;
create trigger swat_validate_exam before insert or update on public.swat_exams for each row execute function swat_internal.validate_exam();

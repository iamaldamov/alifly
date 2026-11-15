-- ALIFLY learner progress is private account data.
-- The browser syncs this table only after Supabase Auth has restored a signed-in user.
-- Keep RLS policies as the row-level boundary and reduce SQL privileges as defense in depth.

REVOKE ALL PRIVILEGES ON TABLE public.user_progress
  FROM PUBLIC, anon, authenticated;

-- The app only needs to read, create, and update the signed-in learner's own progress.
GRANT SELECT, INSERT, UPDATE ON TABLE public.user_progress
  TO authenticated;

-- Fail the migration if anonymous or elevated privileges remain.
DO $$
DECLARE
  column_name text;
BEGIN
  IF has_table_privilege('anon', 'public.user_progress', 'SELECT')
     OR has_table_privilege('anon', 'public.user_progress', 'INSERT')
     OR has_table_privilege('anon', 'public.user_progress', 'UPDATE')
     OR has_table_privilege('anon', 'public.user_progress', 'DELETE')
     OR has_table_privilege('anon', 'public.user_progress', 'TRUNCATE')
     OR has_table_privilege('anon', 'public.user_progress', 'REFERENCES')
     OR has_table_privilege('anon', 'public.user_progress', 'TRIGGER')
     OR has_table_privilege('anon', 'public.user_progress', 'MAINTAIN') THEN
    RAISE EXCEPTION 'anon must not have privileges on public.user_progress';
  END IF;

  IF NOT has_table_privilege('authenticated', 'public.user_progress', 'SELECT')
     OR NOT has_table_privilege('authenticated', 'public.user_progress', 'INSERT')
     OR NOT has_table_privilege('authenticated', 'public.user_progress', 'UPDATE') THEN
    RAISE EXCEPTION 'authenticated must retain SELECT, INSERT, and UPDATE on public.user_progress';
  END IF;

  IF has_table_privilege('authenticated', 'public.user_progress', 'DELETE')
     OR has_table_privilege('authenticated', 'public.user_progress', 'TRUNCATE')
     OR has_table_privilege('authenticated', 'public.user_progress', 'TRIGGER')
     OR has_table_privilege('authenticated', 'public.user_progress', 'REFERENCES')
     OR has_table_privilege('authenticated', 'public.user_progress', 'MAINTAIN') THEN
    RAISE EXCEPTION 'authenticated has unexpected elevated privileges on public.user_progress';
  END IF;

  -- Table-level REVOKE should also remove inherited column grants. Check every
  -- current column so a future schema addition cannot silently expose anon access.
  FOR column_name IN
    SELECT columns.column_name
    FROM information_schema.columns AS columns
    WHERE columns.table_schema = 'public'
      AND columns.table_name = 'user_progress'
  LOOP
    IF has_column_privilege('anon', 'public.user_progress', column_name, 'SELECT')
       OR has_column_privilege('anon', 'public.user_progress', column_name, 'INSERT')
       OR has_column_privilege('anon', 'public.user_progress', column_name, 'UPDATE')
       OR has_column_privilege('anon', 'public.user_progress', column_name, 'REFERENCES') THEN
      RAISE EXCEPTION 'anon has an unexpected column privilege on public.user_progress.%', column_name;
    END IF;

    IF has_column_privilege('authenticated', 'public.user_progress', column_name, 'REFERENCES') THEN
      RAISE EXCEPTION 'authenticated has an unexpected REFERENCES privilege on public.user_progress.%', column_name;
    END IF;
  END LOOP;
END;
$$;

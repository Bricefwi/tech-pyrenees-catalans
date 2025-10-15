-- Fix search_path pour la fonction generate_request_number
DROP FUNCTION IF EXISTS generate_request_number();

CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number integer;
  year_suffix text;
BEGIN
  next_number := nextval('service_request_number_seq');
  year_suffix := to_char(now(), 'YYYY');
  RETURN 'REQ-' || year_suffix || '-' || lpad(next_number::text, 4, '0');
END;
$$;
-- Ajout d'un numéro de demande incrémentiel automatique
CREATE SEQUENCE IF NOT EXISTS service_request_number_seq START 1000;

ALTER TABLE service_requests 
ADD COLUMN request_number text UNIQUE;

-- Fonction pour générer le numéro de demande au format REQ-YYYY-NNNN
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger pour générer automatiquement le numéro lors de l'insertion
CREATE OR REPLACE FUNCTION set_request_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := generate_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_service_request_created
  BEFORE INSERT ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_request_number();

-- Mettre à jour les demandes existantes sans numéro
UPDATE service_requests 
SET request_number = generate_request_number() 
WHERE request_number IS NULL;
-- Ajouter un numéro de devis auto-généré à la table quotes
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1;

ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS quote_number text UNIQUE,
ADD COLUMN IF NOT EXISTS sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS accepted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Fonction pour générer un numéro de devis
CREATE OR REPLACE FUNCTION generate_quote_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number integer;
  year_suffix text;
BEGIN
  next_number := nextval('quote_number_seq');
  year_suffix := to_char(now(), 'YYYY');
  RETURN 'DEV-' || year_suffix || '-' || lpad(next_number::text, 4, '0');
END;
$$;

-- Trigger pour auto-générer le numéro de devis
CREATE OR REPLACE FUNCTION set_quote_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.quote_number IS NULL THEN
    NEW.quote_number := generate_quote_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_quote_number_trigger ON quotes;
CREATE TRIGGER set_quote_number_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_number();

-- Créer la table des commandes (orders)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE,
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE RESTRICT,
  service_request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE RESTRICT,
  client_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'in_progress', 'completed', 'cancelled')),
  amount numeric NOT NULL,
  description text,
  confirmed_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancellation_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Séquence pour numéro de commande
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Fonction pour générer un numéro de commande
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number integer;
  year_suffix text;
BEGIN
  next_number := nextval('order_number_seq');
  year_suffix := to_char(now(), 'YYYY');
  RETURN 'CMD-' || year_suffix || '-' || lpad(next_number::text, 4, '0');
END;
$$;

-- Trigger pour auto-générer le numéro de commande
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_number_trigger ON orders;
CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Créer la table des factures (invoices)
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  service_request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE RESTRICT,
  client_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled', 'overdue')),
  amount numeric NOT NULL,
  tax_rate numeric DEFAULT 20.0,
  tax_amount numeric,
  total_amount numeric,
  description text,
  due_date timestamp with time zone,
  sent_at timestamp with time zone,
  paid_at timestamp with time zone,
  payment_method text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Séquence pour numéro de facture
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Fonction pour générer un numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number integer;
  year_suffix text;
BEGIN
  next_number := nextval('invoice_number_seq');
  year_suffix := to_char(now(), 'YYYY');
  RETURN 'FACT-' || year_suffix || '-' || lpad(next_number::text, 4, '0');
END;
$$;

-- Trigger pour auto-générer le numéro de facture
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_invoice_number_trigger ON invoices;
CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- Trigger pour calculer automatiquement les montants de la facture
CREATE OR REPLACE FUNCTION calculate_invoice_amounts()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.tax_amount := NEW.amount * (NEW.tax_rate / 100);
  NEW.total_amount := NEW.amount + NEW.tax_amount;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS calculate_invoice_amounts_trigger ON invoices;
CREATE TRIGGER calculate_invoice_amounts_trigger
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_amounts();

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- RLS pour orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all orders"
ON orders FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their orders"
ON orders FOR SELECT
TO authenticated
USING (client_user_id = auth.uid());

-- RLS pour invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all invoices"
ON invoices FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their invoices"
ON invoices FOR SELECT
TO authenticated
USING (client_user_id = auth.uid());
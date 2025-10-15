-- Add quote_status column to service_requests
ALTER TABLE public.service_requests
ADD COLUMN quote_status text DEFAULT 'no_quote' CHECK (quote_status IN ('no_quote', 'quote_sent', 'quote_accepted', 'quote_rejected'));

COMMENT ON COLUMN public.service_requests.quote_status IS 'Status of the quote: no_quote, quote_sent, quote_accepted, quote_rejected';
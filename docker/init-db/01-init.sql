\connect distribution_orchestrator;
-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: distribution_run
CREATE TABLE IF NOT EXISTS public.distribution_run (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,

  tenant_id varchar NOT NULL,
  event_id varchar NOT NULL,

  status varchar NOT NULL,
  -- RUNNING | FINISHED | FAILED | CANCELED

  started_at timestamptz DEFAULT now() NOT NULL,
  finished_at timestamptz NULL,

  total_started int DEFAULT 0 NOT NULL,
  total_processed int DEFAULT 0 NOT NULL,
  total_approved int DEFAULT 0 NOT NULL,
  total_inserted int DEFAULT 0 NOT NULL,
  total_failed int DEFAULT 0 NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_distribution_run_event
  ON public.distribution_run(event_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_distribution_run_status
  ON public.distribution_run(status);

-- Tabela: distribution_run_minute
CREATE TABLE IF NOT EXISTS public.distribution_run_minute (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,

  run_id uuid NOT NULL,
  minute_bucket timestamptz NOT NULL,

  started int DEFAULT 0 NOT NULL,
  processed int DEFAULT 0 NOT NULL,
  approved int DEFAULT 0 NOT NULL,
  inserted int DEFAULT 0 NOT NULL,
  failed int DEFAULT 0 NOT NULL,
  rate int DEFAULT 0 NOT NULL,

  CONSTRAINT fk_distribution_run
    FOREIGN KEY (run_id)
    REFERENCES public.distribution_run(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_distribution_run_minute
  ON public.distribution_run_minute(run_id, minute_bucket);

CREATE INDEX IF NOT EXISTS idx_distribution_run_minute_bucket
  ON public.distribution_run_minute(minute_bucket DESC);

-- Tabela: event_distribution
CREATE TABLE IF NOT EXISTS public.event_distribution (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,

  tenant_id varchar NOT NULL,
  event_id varchar NOT NULL,

  document varchar NOT NULL,
  origin_token varchar NULL,
  biometric_id uuid NULL,

  distribution_status varchar NOT NULL,
  -- NOT_DISTRIBUTED | PROCESSING | DISTRIBUTED | FAILED

  sync_id uuid NULL,
  error_message varchar NULL,

  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_event_distribution_event_document
  ON public.event_distribution(event_id, document);

CREATE INDEX IF NOT EXISTS idx_event_distribution_event_status
  ON public.event_distribution(event_id, distribution_status);

CREATE INDEX IF NOT EXISTS idx_event_distribution_event_created
  ON public.event_distribution(event_id, created_at DESC);
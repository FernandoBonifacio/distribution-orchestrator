\connect distribution_orchestrator;
-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: distribution_run
CREATE TABLE IF NOT EXISTS public.distribution_run (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,

  tenant_id varchar NOT NULL,
  event_id varchar NOT NULL,

  status varchar NOT NULL,
  -- RUNNING | FINISHED | FAILED | CANCELLED

  total_found int DEFAULT 0 NOT NULL,
  total_eligible int DEFAULT 0 NOT NULL,
  total_processed int DEFAULT 0 NOT NULL,
  total_distributed int DEFAULT 0 NOT NULL,
  total_failed int DEFAULT 0 NOT NULL,
  total_duplicated int DEFAULT 0 NOT NULL,

  created_at timestamptz DEFAULT now() NOT NULL,
  started_at timestamptz NULL,
  finished_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_distribution_run_event
  ON public.distribution_run(event_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_distribution_run_status
  ON public.distribution_run(status);

-- Tabela: distribution_run_minute
CREATE TABLE IF NOT EXISTS public.distribution_run_minute (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,

  distribution_run_id uuid NOT NULL,
  minute timestamptz NOT NULL,

  processed int DEFAULT 0 NOT NULL,
  distributed int DEFAULT 0 NOT NULL,
  failed int DEFAULT 0 NOT NULL,
  duplicated int DEFAULT 0 NOT NULL,

  created_at timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT fk_distribution_run
    FOREIGN KEY (distribution_run_id)
    REFERENCES public.distribution_run(id)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_distribution_run_minute
  ON public.distribution_run_minute(distribution_run_id, minute);

CREATE INDEX IF NOT EXISTS idx_distribution_run_minute_bucket
  ON public.distribution_run_minute(minute DESC);

-- Tabela: event_distribution
CREATE TABLE IF NOT EXISTS public.event_distribution (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,

  distribution_run_id uuid NOT NULL,
  event_id varchar NOT NULL,

  document varchar NOT NULL,
  user_id varchar NOT NULL,
  biometric_id varchar NOT NULL,

  status varchar NOT NULL,
  error_message varchar NULL,

  created_at timestamptz DEFAULT now() NOT NULL,
  processed_at timestamptz NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT fk_event_distribution_run
    FOREIGN KEY (distribution_run_id)
    REFERENCES public.distribution_run(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_distribution_run
  ON public.event_distribution(distribution_run_id);

CREATE INDEX IF NOT EXISTS idx_event_distribution_event
  ON public.event_distribution(event_id);

CREATE TABLE subscription_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_key text NOT NULL,
  status text NOT NULL CHECK (status IN ('ignored', 'canceled')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, merchant_key)
);

ALTER TABLE subscription_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their subscription overrides"
  ON subscription_overrides FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

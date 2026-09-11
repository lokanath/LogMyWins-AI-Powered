CREATE TABLE public.wins (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    win_date date NOT NULL,
    description text NOT NULL,
    business_impact text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.wins TO authenticated;
GRANT ALL ON public.wins TO service_role;

ALTER TABLE public.wins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wins"
ON public.wins FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own wins"
ON public.wins FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wins"
ON public.wins FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own wins"
ON public.wins FOR DELETE
TO authenticated
USING (user_id = auth.uid());
ALTER TABLE invitations ADD COLUMN is_template_sample INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_invitations_template_sample ON invitations(is_template_sample);

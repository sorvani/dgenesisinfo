ALTER TABLE characters         ADD COLUMN cite_first_known_source_type TEXT;
ALTER TABLE character_rankings ADD COLUMN cite_source_type TEXT;
ALTER TABLE character_stats    ADD COLUMN cite_source_type TEXT;
ALTER TABLE character_orbs     ADD COLUMN cite_source_type TEXT;
ALTER TABLE orb_drop_rates     ADD COLUMN cite_source_type TEXT;
ALTER TABLE timeline_events    ADD COLUMN cite_source_type TEXT;
ALTER TABLE dungeons           ADD COLUMN cite_source_type TEXT;
ALTER TABLE monsters           ADD COLUMN cite_source_type TEXT;

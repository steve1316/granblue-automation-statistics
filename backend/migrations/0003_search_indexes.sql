-- Composite indexes for the dashboard's most common search patterns. Every query filters by a date
-- range, and most also filter by one of farming_mode, mission or item_name.
create index if not exists results_farming_mode_date_range_idx on results (farming_mode, date desc, id desc);
create index if not exists results_mission_date_range_idx on results (mission, date desc, id desc);
create index if not exists results_item_name_date_range_idx on results (item_name, date desc, id desc);
create index if not exists results_platform_date_range_idx on results (platform, date desc, id desc);
create index if not exists results_username_date_range_idx on results (username, date desc, id desc);

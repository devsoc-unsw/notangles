-- Update the colour column in the events table based on the MIGRATE_COLOR_MAP

UPDATE "events"
SET "colour" = CASE
  WHEN "colour" = '#137786' THEN 'default-1'
  WHEN "colour" = '#a843a4' THEN 'default-2'
  WHEN "colour" = '#134e86' THEN 'default-3'
  WHEN "colour" = '#138652' THEN 'default-4'
  WHEN "colour" = '#861313' THEN 'default-5'
  WHEN "colour" = '#868413' THEN 'default-6'
  WHEN "colour" = '#2e89ff' THEN 'default-7'
  WHEN "colour" = '#3323ad' THEN 'default-8'
  ELSE "colour"
END
WHERE "colour" IN ('#137786', '#a843a4', '#134e86', '#138652', '#861313', '#868413', '#2e89ff', '#3323ad');
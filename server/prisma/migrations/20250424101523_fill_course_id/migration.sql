-- classNo is currently a string such as COMP6420Undergraduate-11965-T1-2025
-- courseId should be a string such as COMP6420Undergraduate
UPDATE "classes"
SET "courseId" = split_part("classNo", '-', 1);

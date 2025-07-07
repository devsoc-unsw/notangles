import defaults from '../constants/defaults';
import migrateThemes from './migrations/colourTheme';
import migratePrimaryTimetables from './migrations/primaryTimetables';
import { createDefaultTimetable } from './timetableHelpers';

const STORAGE_KEY = 'data';

const storage = {
  get: (key: string): any => {
    const data: Record<string, any> = storage.load();

    if (key in data) {
      return data[key];
    }
    if (key in defaults) {
      storage.set(key, defaults[key]);
      return defaults[key];
    }

    return null;
  },

  set: (key: string, value: any) => {
    const data: Record<string, any> = storage.load();
    data[key] = value;
    storage.save(data);
  },

  load: (): Record<string, any> => {
    let data: Record<string, any> = {};

    if (localStorage[STORAGE_KEY]) {
      data = JSON.parse(localStorage[STORAGE_KEY]);
      // migrate old data format to new format when the app is already visited
      if (localStorage['visited']) {
        data = storage.migrate(data);
      }
    } else {
      storage.save(data);
    }

    return data;
  },

  save: (data: Record<string, any>) => {
    localStorage[STORAGE_KEY] = JSON.stringify(data);
  },

  migrate: (data: Record<string, any>) => {
    let migrated = data;

    // Check if data is empty or not an object or it is {}
    if (
      !data ||
      typeof data !== 'object' ||
      Object.keys(data).length === 0 ||
      data.timetables === undefined ||
      typeof data.timetables !== 'object' ||
      Array.isArray(data.timetables)
    ) {
      migrated = { ...defaults };
      storage.save(migrated);
      return migrated;
    }

    // Un-break an existing issue with migrated data
    if (migrated.version == null || migrated.version < 2) {
      Object.entries(migrated.timetables).forEach(([term, timetables]) => {
        if (
          !Array.isArray(timetables) ||
          !timetables.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))
        ) {
          migrated.timetables[term] = createDefaultTimetable('');
        }
      });
    }

    // only do this if version does not exist
    if (migrated.version == null) {
      migrated = {
        ...migrated,
        version: 1,
        timetables: migrateThemes(migrated.timetables),
      };
      storage.save(migrated);
    }

    if (migrated.version === 1) {
      migrated = {
        ...migrated,
        version: 2,
        timetables: migratePrimaryTimetables(migrated.timetables),
      };
      storage.save(migrated);
    }

    return migrated;
  },
};

storage.load();

export default storage;

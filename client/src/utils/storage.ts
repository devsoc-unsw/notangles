import defaults from '../constants/defaults';
import migrateThemes from './migrations/colourTheme';
import migratePrimaryTimetables from './migrations/primaryTimetables';

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
    // Check if data is empty or not an object or it is {}
    if (!data || typeof data !== 'object' || Object.keys(data).length === 0 || data.timetables === undefined) {
      storage.save(defaults);
      return defaults;
    }

    // only do this if version does not exist
    if (data.version == null) {
      let migrated = {
        ...data,
        version: 1,
        timetables: migrateThemes(data.timetables),
      };
      storage.save(migrated);
      return migrated;
    }
    if (data.version === 1) {
      let migrated = {
        ...data,
        version: 2,
        timetables: migratePrimaryTimetables(data.timetables),
      };
      storage.save(migrated);
      return migrated;
    }
    return data;
  },
};

storage.load();

export default storage;

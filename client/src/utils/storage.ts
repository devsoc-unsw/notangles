import defaults from '../constants/defaults';

const STORAGE_KEY = 'data';

const MIGRATE_COLOR_MAP: Record<string, string> = {
  '#137786': 'default-1',
  '#a843a4': 'default-2',
  '#134e86': 'default-3',
  '#138652': 'default-4',
  '#861313': 'default-5',
  '#868413': 'default-6',
  '#2e89ff': 'default-7',
  '#3323ad': 'default-8',
};

const migrateTimetables = (timetables: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(timetables).map(([termKey, termValue]) => [termKey, termValue.map(migrateTimetable)]),
  );
};

const migrateTimetable = (timetable: any) => {
  return {
    ...timetable,
    createdEvents: migrateCreatedEvents(timetable.createdEvents),
    assignedColors: migrateAssignedColors(timetable.assignedColors),
  };
};

const migrateCreatedEvents = (createdEvents: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(createdEvents).map(([eventKey, eventValue]) => [
      eventKey,
      {
        ...eventValue,
        event: {
          ...eventValue.event,
          color:
            eventValue.event.color in MIGRATE_COLOR_MAP
              ? MIGRATE_COLOR_MAP[eventValue.event.color]
              : eventValue.event.color,
        },
      },
    ]),
  );
};

const migrateAssignedColors = (assignedColors: Record<string, string>) => {
  return Object.fromEntries(
    Object.entries(assignedColors).map(([key, color]) => [
      key,
      color in MIGRATE_COLOR_MAP ? MIGRATE_COLOR_MAP[color] : color,
    ]),
  );
};

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
      // migrate old data format to new format
      data = storage.migrate(data);
    } else {
      storage.save(data);
    }

    return data;
  },

  save: (data: Record<string, any>) => {
    localStorage[STORAGE_KEY] = JSON.stringify(data);
  },

  migrate: (data: Record<string, any>) => {
    // User has never seen Notangles
    if (!data || typeof data !== 'object') {
      data = defaults;
    }

    // only do this if version does not exist
    if (data.version !== 1 || data.version == null) {
      let migrated = {
        ...data,
        version: 1,
        timetables: migrateTimetables(data.timetables),
      };
      storage.save(migrated);
      return migrated;
    }
    return data;
  },
};

storage.load();

export default storage;

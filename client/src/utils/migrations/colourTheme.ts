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

export default migrateTimetables;

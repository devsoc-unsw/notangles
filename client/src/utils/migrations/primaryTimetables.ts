const migrateTerms = (terms: Record<string, any>) => {
  return Object.fromEntries(Object.entries(terms).map(([term, data]) => [term, migrateTerm(data)]));
};

const migrateTerm = (termTimetables: any) => {
  if (termTimetables.length < 0) return termTimetables;
  return termTimetables.map((t: any, index: number) => {
    return {
      ...t,
      isPrimary: index === 0,
    };
  });
};

export default migrateTerms;

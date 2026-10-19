export interface ClassCardIdentity {
  courseId: string;
  activity: string;
  classId: string | null;
  timeIndex: number | null;
  dayIndex?: number;
  startMinutes?: number;
}

export type KeyedClassCard<T extends ClassCardIdentity = ClassCardIdentity> = T & { key: string };

export interface DraggedCardMapping {
  sourceKey: string;
  targetClassId: string | null;
  targetTimeIndex: number | null;
}

interface CardMatch {
  prevIndex: number;
  nextIndex: number;
  timeDistance: number;
}

const hasSameActivity = (prev: ClassCardIdentity, next: ClassCardIdentity) =>
  prev.courseId === next.courseId && prev.activity === next.activity;

const isSameClass = (prev: ClassCardIdentity, next: ClassCardIdentity) =>
  hasSameActivity(prev, next) && prev.classId === next.classId && prev.timeIndex === next.timeIndex;

const getTimeDistance = (prev: ClassCardIdentity, next: ClassCardIdentity) => {
  if (
    prev.dayIndex === undefined ||
    next.dayIndex === undefined ||
    prev.startMinutes === undefined ||
    next.startMinutes === undefined
  ) {
    return Infinity;
  }

  const dayDiff = Math.abs(prev.dayIndex - next.dayIndex);
  const startTimeDiff = Math.abs(prev.startMinutes - next.startMinutes);
  return dayDiff * 24 * 60 + startTimeDiff;
};

// Reuse React keys while keeping all card data and ordering from nextCards
export const assignClassCardKeys = <T extends ClassCardIdentity>(
  prevCards: KeyedClassCard[],
  nextCards: T[],
  draggedCardMapping?: DraggedCardMapping,
  keyGeneration = 0,
): KeyedClassCard<T>[] => {
  const assignedKeys: (string | undefined)[] = Array.from({ length: nextCards.length });
  const matchedPrevIndices = new Set<number>();

  const reuseKey = (prevIndex: number, nextIndex: number) => {
    assignedKeys[nextIndex] = prevCards[prevIndex].key;
    matchedPrevIndices.add(prevIndex);
  };
  const isPrevCardUnmatched = (index: number) => !matchedPrevIndices.has(index);
  const needsKey = (index: number) => assignedKeys[index] === undefined;

  // Keep the dragged DOM node attached to the target class
  if (draggedCardMapping) {
    const srcIndex = prevCards.findIndex((card) => card.key === draggedCardMapping.sourceKey);
    if (srcIndex !== -1) {
      const srcCard = prevCards[srcIndex];
      const targetIndex = nextCards.findIndex(
        (card) =>
          hasSameActivity(srcCard, card) &&
          card.classId === draggedCardMapping.targetClassId &&
          card.timeIndex === draggedCardMapping.targetTimeIndex,
      );
      if (targetIndex !== -1) reuseKey(srcIndex, targetIndex);
    }
  }

  // Preserve unchanged classes before matching cards
  nextCards.forEach((nextCard, nextIndex) => {
    if (!needsKey(nextIndex)) return;

    const prevIndex = prevCards.findIndex(
      (prevCard, index) => isPrevCardUnmatched(index) && isSameClass(prevCard, nextCard),
    );

    if (prevIndex !== -1) {
      reuseKey(prevIndex, nextIndex);
    }
  });

  // Reuse remaining cards of the same activity
  const candidateMatches: CardMatch[] = [];
  for (const [prevIndex, prevCard] of prevCards.entries()) {
    if (!isPrevCardUnmatched(prevIndex)) continue;

    for (const [nextIndex, nextCard] of nextCards.entries()) {
      if (!needsKey(nextIndex) || !hasSameActivity(prevCard, nextCard)) continue;

      candidateMatches.push({
        prevIndex,
        nextIndex,
        timeDistance: getTimeDistance(prevCard, nextCard),
      });
    }
  }

  candidateMatches.sort((first, second) => {
    if (first.timeDistance !== second.timeDistance) return first.timeDistance < second.timeDistance ? -1 : 1;
    return first.prevIndex - second.prevIndex || first.nextIndex - second.nextIndex;
  });

  for (const { prevIndex, nextIndex } of candidateMatches) {
    if (isPrevCardUnmatched(prevIndex) && needsKey(nextIndex)) reuseKey(prevIndex, nextIndex);
  }

  // Generate keys for new cards
  const reservedKeys = new Set(prevCards.map((card) => card.key));
  return nextCards.map((card, index) => {
    let key = assignedKeys[index];
    if (key === undefined) {
      let slot = 0;
      do {
        key = `class-card:${JSON.stringify([card.courseId, card.activity, keyGeneration, slot])}`;
        slot += 1;
      } while (reservedKeys.has(key));
      reservedKeys.add(key);
    }
    return { ...card, key };
  });
};

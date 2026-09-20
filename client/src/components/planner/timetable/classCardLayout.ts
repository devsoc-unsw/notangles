export interface ClassCardIdentity {
  courseId: string;
  activity: string;
  classId: string | null;
  timeIndex: number | null;
  dayIndex?: number;
  startMinutes?: number;
}

export type KeyedClassCard<T extends ClassCardIdentity = ClassCardIdentity> = T & { key: string };

export interface ClassCardKeyAnchor {
  sourceKey: string;
  targetClassId: string | null;
  targetTimeIndex: number | null;
}

const hasSameActivity = (previousCard: ClassCardIdentity, nextCard: ClassCardIdentity) =>
  previousCard.courseId === nextCard.courseId && previousCard.activity === nextCard.activity;

const isSameMeeting = (previousCard: ClassCardIdentity, nextCard: ClassCardIdentity) =>
  hasSameActivity(previousCard, nextCard) &&
  previousCard.classId === nextCard.classId &&
  previousCard.timeIndex === nextCard.timeIndex;

const getTimeDistance = (previousCard: ClassCardIdentity, nextCard: ClassCardIdentity) => {
  if (
    previousCard.dayIndex === undefined ||
    nextCard.dayIndex === undefined ||
    previousCard.startMinutes === undefined ||
    nextCard.startMinutes === undefined
  ) {
    return Infinity;
  }

  const dayDifference = Math.abs(previousCard.dayIndex - nextCard.dayIndex);
  const startTimeDifference = Math.abs(previousCard.startMinutes - nextCard.startMinutes);
  return dayDifference * 24 * 60 + startTimeDifference;
};

interface CardMatch {
  previousIndex: number;
  nextIndex: number;
  timeDistance: number;
}

// Reuse React keys while keeping all card data and ordering from nextCards
export const reconcileClassCardKeys = <T extends ClassCardIdentity>(
  previousCards: readonly KeyedClassCard[],
  nextCards: readonly T[],
  anchor?: ClassCardKeyAnchor,
): KeyedClassCard<T>[] => {
  const assignedKeys: (string | undefined)[] = Array.from({ length: nextCards.length });
  const matchedPreviousIndices = new Set<number>();

  const reuseKey = (previousIndex: number, nextIndex: number) => {
    assignedKeys[nextIndex] = previousCards[previousIndex].key;
    matchedPreviousIndices.add(previousIndex);
  };
  const isPreviousCardUnmatched = (index: number) => !matchedPreviousIndices.has(index);
  const needsKey = (index: number) => assignedKeys[index] === undefined;

  // Keep the dragged DOM node attached to the target meeting
  if (anchor) {
    const sourceIndex = previousCards.findIndex((card) => card.key === anchor.sourceKey);
    if (sourceIndex !== -1) {
      const sourceCard = previousCards[sourceIndex];
      const targetIndex = nextCards.findIndex(
        (card) =>
          hasSameActivity(sourceCard, card) &&
          card.classId === anchor.targetClassId &&
          card.timeIndex === anchor.targetTimeIndex,
      );
      if (targetIndex !== -1) reuseKey(sourceIndex, targetIndex);
    }
  }

  // Preserve unchanged meetings before matching cards
  nextCards.forEach((nextCard, nextIndex) => {
    if (!needsKey(nextIndex)) return;
    const previousIndex = previousCards.findIndex(
      (previousCard, index) => isPreviousCardUnmatched(index) && isSameMeeting(previousCard, nextCard),
    );
    if (previousIndex !== -1) reuseKey(previousIndex, nextIndex);
  });

  // Reuse remaining cards of the same activity
  const candidateMatches: CardMatch[] = [];
  for (const [previousIndex, previousCard] of previousCards.entries()) {
    if (!isPreviousCardUnmatched(previousIndex)) continue;

    for (const [nextIndex, nextCard] of nextCards.entries()) {
      if (!needsKey(nextIndex) || !hasSameActivity(previousCard, nextCard)) continue;
      candidateMatches.push({
        previousIndex,
        nextIndex,
        timeDistance: getTimeDistance(previousCard, nextCard),
      });
    }
  }

  candidateMatches.sort((first, second) => {
    if (first.timeDistance !== second.timeDistance) return first.timeDistance < second.timeDistance ? -1 : 1;
    return first.previousIndex - second.previousIndex || first.nextIndex - second.nextIndex;
  });

  for (const { previousIndex, nextIndex } of candidateMatches) {
    if (isPreviousCardUnmatched(previousIndex) && needsKey(nextIndex)) reuseKey(previousIndex, nextIndex);
  }

  // Generate keys for new cards
  const reservedKeys = new Set(previousCards.map((card) => card.key));
  return nextCards.map((card, index) => {
    let key = assignedKeys[index];
    if (key === undefined) {
      let slot = 0;
      do {
        key = `class-card:${JSON.stringify([card.courseId, card.activity, slot])}`;
        slot += 1;
      } while (reservedKeys.has(key));
      reservedKeys.add(key);
    }
    return { ...card, key };
  });
};

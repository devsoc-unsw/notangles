// DO NOT EXPORT
interface BaseCard {
  name: string;
  location?: string;
  color: string;
}

export interface UnscheduledCard extends BaseCard {
  type: 'unscheduled';
}

export interface EventCard extends BaseCard {
  type: 'event';
  eventType: 'CUSTOM' | 'TUTORING';
  eventId: string;
  description?: string;
  time: EventTime;
}

export interface EventTime {
  start: number;
  end: number;
  day: number;
}

export interface ClassTime extends EventTime {
  weeks: number[];
}

export interface ClassCard extends BaseCard {
  type: 'class';
  time: ClassTime;
}

export type Card = ClassCard | EventCard | UnscheduledCard;

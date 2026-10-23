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

// events / periods for autotimetabling

export interface CreatedEvent {
  time: {
    day: string | number;
    start: number;
    end: number;
  };
}

export interface PeriodInfo {
  periodsPerClass: number;
  periodTimes: [string | number, number];
  durations: [number];
}

export interface TimetablePayload {
  start?: string | number;
  end?: string | number;
  days?: string | number;
  gap?: string | number;
  maxdays?: string | number;
  periodInfoList: PeriodInfo[];
  [key: string]: unknown;
}


export interface ClassTime extends EventTime {
  weeks: number[];
}

export interface ClassCard extends BaseCard {
  type: 'class';
  time: ClassTime;
}

export type Card = ClassCard | EventCard | UnscheduledCard;

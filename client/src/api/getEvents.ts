import { gql } from '@apollo/client';
import { EventDTO, EventPeriod, CreatedEvents } from '../interfaces/Periods';
import { client } from './config';
import NetworkError from '../interfaces/NetworkError';

export const typeDefs = `#graphql
  type Event {
    id: ID!
    name: String!
    location: String
    description: String
    colour: String!
    day: String!
    start: String!
    end: String!
    timetableId: String!
    groupIds: [String!]
  }

  type Query {
    events: [Event!]!
  }
`;

const events = [
  {
    id: 'event-1',
    name: 'DevSoc',
    location: 'Room 404',
    description: 'Devsoc part 1.',
    colour: '#3498db',
    day: '1',
    start: '2026-03-02T09:00:00.000Z',
    end: '2026-03-02T11:00:00.000Z',
    timetableId: 'timetableId',
    groupIds: [],
  },
  {
    id: 'event-2',
    name: 'DevSoc',
    location: 'Room 606',
    description: 'Devsoc part 2',
    colour: '#3498db',
    day: '3',
    start: '2026-03-04T14:00:00.000Z',
    end: '2026-03-04T16:00:00.000Z',
    timetableId: 'timetableId2',
    groupIds: [],
  },
  {
    id: 'event-3',
    name: 'Other',
    location: 'Quad',
    description: 'Other part 1',
    colour: '#e67e22',
    day: '5',
    start: '2026-03-06T12:00:00.000Z',
    end: '2026-03-06T13:30:00.000Z',
    timetableId: 'timetableId3',
    groupIds: [],
  },
];

export const resolvers = {
  Query: {
    // This sends back the hardcoded array directly
    events: () => events,
  },
};

const toCreatedEvents = (data: EventDTO[]): CreatedEvents => {
  const eventsMap: CreatedEvents = {};

  data.forEach((eventDto) => {
    // Mapping properties to fit EventPeriod
    const eventPeriod: EventPeriod = {
      type: 'event',
      subtype: eventDto.groupIds && eventDto.groupIds.length > 0 ? 'Tutoring' : 'General',
      event: {
        id: eventDto.id,
        name: eventDto.name,
        location: eventDto.location ?? '',
        description: eventDto.description ?? '',
        color: eventDto.colour,
      },
      time: {
        day: parseInt(eventDto.day, 10) || 0,
        start: eventDto.start.getHours() * 60 + eventDto.start.getMinutes(),
        end: eventDto.end.getHours() * 60 + eventDto.end.getMinutes(),
      },
    };

    // Key is EventCode
    eventsMap[eventDto.id] = eventPeriod;
  });

  return eventsMap;
};

// GraphQL Query pulling fields matching EventDTO interface
const GET_EVENTS_LIST = gql`
  query GetEventsByTimetable {
    events {
      id
      name
      location
      description
      colour
      day
      start
      end
      timetableId
      groupIds
    }
  }
`;

/**
 * Fetches a map of event objects linked to a specific timetable ID,
 * formatted and transformed into a structure ready for localized state manipulation.
 *
 * Expected response format: {events: [...]};
 *
 * @param timetableId The current primary timetable identifier to filter records
 * @return A promise containing the CreatedEvents record mapping
 *
 * @example
 * const eventsList = await getEventsList('timetable-uuid-123')
 */
// eslint-disable-next-line @typescript-eslint/require-await -- TEMPORARY await returns once real fetch is restored
const getEventsList = async (timetableId: string): Promise<{ events: CreatedEvents }> => {
  try {
    // TODO: swap back to the regular query once real backend exists
    // const { data } = await client.query({ query: GET_EVENTS_LIST });

    const data = { events };

    // Filter out events that do not match the requested timetableId, converting the raw
    // ISO date strings into real Date objects (toCreatedEvents calls Date methods on them)
    const filteredEvents = data.events
      .filter((event) => event.timetableId === timetableId)
      .map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));

    return {
      events: toCreatedEvents(filteredEvents),
    };
  } catch (error) {
    throw new NetworkError('Could not connect to server');
  }
};

export default getEventsList;

/**
 * Fetches every event for browsing/searching
 *
 * Unlike getEventsList, this does not convert events into the timetable grid's day/minutes shape
 * (EventPeriod) via toCreatedEvents. Callers here need the real calendar date/time (e.g. to display
 * "28 April")
 *
 * @return A promise containing every event, with start/end as real Date objects
 */
// eslint-disable-next-line @typescript-eslint/require-await -- temporary stub, await returns once real fetch is restored
export const getAllEvents = async (): Promise<EventDTO[]> => {
  try {
    // TODO: swap back to the regular query once real backend exists
    // const { data } = await client.query({ query: GET_EVENTS_LIST });
    const data = { events };

    return data.events.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  } catch (error) {
    throw new NetworkError('Could not connect to server');
  }
};

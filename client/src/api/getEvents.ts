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
    name: 'Devsoc',
    location: 'Room 404',
    description: 'Devsoc part 1.',
    colour: '#3498db',
    day: '1',
    start: '2026-03-02T09:00:00.000Z',
    end: '2026-03-02T11:00:00.000Z',
    timetableId: 'timetableId',
    groupIds: [''],
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
const getEventsList = async (timetableId: string): Promise<{ events: CreatedEvents }> => {
  try {
    const { data } = await client.query({ query: GET_EVENTS_LIST });

    // Filter out events that do not match the requested timetableId
    const events = data.events.filter((event: EventDTO) => event.timetableId === timetableId);

    return {
      events: toCreatedEvents(events),
    };
  } catch (error) {
    throw new NetworkError('Could not connect to server');
  }
};

export default getEventsList;

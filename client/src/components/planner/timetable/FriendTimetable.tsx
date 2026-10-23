// TODO: Replace mock JSON with a real query once the backend can return a friend's timetable
import { Term } from '../../../api/times/times';
import { TimetableEvent } from '../../../api/timetable/routes';
import TimetableGrid from './FriendGrid';
import mockFriendEvents from './mockFriendEvents.json';

// Imports JSON object as mockFriendEvents
const mockEvents = mockFriendEvents as Record<string, TimetableEvent[]>;

function FriendTimetable({ term }: { term: Term }) {
  // Array of events to put on calendar
  const events = term.term in mockEvents ? mockEvents[term.term] : [];

  if (events.length === 0) {
    return <p className="my-16 text-center text-base text-gray-500">No timetable for this term yet</p>;
  }

  return <TimetableGrid timetableId="mock-friend" classTimes={[]} events={events} />;
}

export default FriendTimetable;

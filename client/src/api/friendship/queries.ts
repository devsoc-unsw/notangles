import { useSuspenseQuery } from '@tanstack/react-query';

import { getFriends, getIncomingRequests, getOutgoingRequests } from './routes';

export const useFriendsQuery = () =>
  useSuspenseQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
  }).data;

export const useIncomingRequestsQuery = () =>
  useSuspenseQuery({
    queryKey: ['friendRequests', 'incoming'],
    queryFn: getIncomingRequests,
  }).data;

export const useOutgoingRequestsQuery = () =>
  useSuspenseQuery({
    queryKey: ['friendRequests', 'outgoing'],
    queryFn: getOutgoingRequests,
  }).data;

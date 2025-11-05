import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { getFriends, getFriendRequests, getUserSettings } from './routes';

export const useGetUserSettingsQuery = () =>
  useSuspenseQuery({
    queryKey: ['settings'],
    queryFn: getUserSettings,
  }).data;

export const useFriendsQuery = () => {
  return useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
  });
};

export const useFriendRequestsQuery = () => {
  return useQuery({
    queryKey: ['friendRequests'],
    queryFn: getFriendRequests,
  });
};

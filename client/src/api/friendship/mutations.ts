import { QueryClient, useMutation } from '@tanstack/react-query';

import { acceptFriendRequest, deleteFriendRequest, removeFriend, sendFriendRequest } from './routes';

export const useSendFriendRequest = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: (requesteeCode: string) => sendFriendRequest(requesteeCode),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['friendRequests', 'outgoing'] });
    },
  });

export const useDeleteFriendRequest = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: (userId: string) => deleteFriendRequest(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
      await queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

export const useAcceptFriendRequest = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: (requestorId: string) => acceptFriendRequest(requestorId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['friends'] });
      await queryClient.invalidateQueries({ queryKey: ['friendRequests', 'incoming'] });
    },
  });

export const useRemoveFriend = (queryClient: QueryClient) =>
  useMutation({
    mutationFn: (friendId: string) => removeFriend(friendId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

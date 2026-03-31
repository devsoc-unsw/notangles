import { FriendInfo } from '../../interfaces/User';
import { apiClient } from '../config';

export const getFriends = async (): Promise<FriendInfo[]> => {
  return (await apiClient.get<FriendInfo[]>('/friendship')).data;
};

export const getOutgoingRequests = async (): Promise<FriendInfo[]> => {
  return (await apiClient.get<FriendInfo[]>('/friendship/requests/outgoing')).data;
};

export const getIncomingRequests = async (): Promise<FriendInfo[]> => {
  return (await apiClient.get<FriendInfo[]>('/friendship/requests/incoming')).data;
};

export const sendFriendRequest = async (requesteeCode: string): Promise<void> => {
  await apiClient.post('/friendship', { requesteeCode });
};

export const deleteFriendRequest = async (userId: string): Promise<void> => {
  await apiClient.delete(`/friendship/requests/${userId}`);
};

export const acceptFriendRequest = async (requestorId: string): Promise<void> => {
  await apiClient.post('/friendship/accept', { requestorId });
};

export const removeFriend = async (friendId: string): Promise<void> => {
  await apiClient.post('/friendship/remove', { friendId });
};

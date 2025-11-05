import axios from 'axios';

import { UserInfo, UserSettings } from '../../interfaces/User';
import { API_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_URL.server,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUserProfile = async (): Promise<UserInfo> => {
  return (await apiClient.get('/user/profile')).data;
};

export const getUserSettings = async (): Promise<UserSettings> => {
  return (await apiClient.get('/user/settings')).data;
};

export const setUserSettings = async (settings: Partial<UserSettings>): Promise<void> => {
  await apiClient.post('/user/settings', settings);
};

export const getFriends = async (): Promise<UserInfo[]> => {
  return (await apiClient.get('/friendships')).data;
};

export const getFriendRequests = async (): Promise<UserInfo[]> => {
  return (await apiClient.get('/friendships/requests')).data;
};

export const createFriendRequest = async (requesteeCode: string): Promise<void> => {
  await apiClient.post('/friendships', { requesteeCode });
};

export const cancelFriendRequest = async (requesteeCode: string): Promise<void> => {
  await apiClient.post('/friendships/cancel', { requesteeCode });
};

export const acceptFriendRequest = async (requestorCode: string): Promise<void> => {
  await apiClient.post('/friendships/accept', { requestorCode });
};

export const rejectFriendRequest = async (requestorCode: string): Promise<void> => {
  await apiClient.post('/friendships/reject', { requestorCode });
};

export const removeFriend = async (otherCode: string): Promise<void> => {
  await apiClient.post('/friendships/remove', { otherCode });
};

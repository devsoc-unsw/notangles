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

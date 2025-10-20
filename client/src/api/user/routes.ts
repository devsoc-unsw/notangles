import { UserInfo, UserSettings } from '../../interfaces/User';
import { apiClient } from '../config';

export const getUserProfile = async (): Promise<UserInfo> => {
  return (await apiClient.get<UserInfo>('/user/profile')).data;
};

export const getUserSettings = async (): Promise<UserSettings> => {
  return (await apiClient.get<UserSettings>('/user/settings')).data;
};

export const postUserProfilePicture = async (imgSrc: string): Promise<void> => {
  await apiClient.post('/user/profile/picture', { url: imgSrc });
};

export const setUserSettings = async (settings: Partial<UserSettings>): Promise<void> => {
  await apiClient.post('/user/settings', settings);
};

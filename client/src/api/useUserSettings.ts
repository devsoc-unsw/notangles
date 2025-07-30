import { queryOptions, useMutation } from '@tanstack/react-query';
import { API_URL } from './config';
import { UserSetting } from './types';

const getUserSettings = async (): Promise<UserSetting> => {
  try {
    const res = await fetch(`${API_URL.server}/user/settings`, {
      method: 'GET',
      credentials: 'include',
    });
    if (res.status !== 200) {
      throw new Error('Could not fetch user settings');
    }
    return await res.json();
  } catch (error) {
    throw new Error('Error fetching user settings');
  }
};

const setUserSettings = async (settings: Partial<UserSetting>): Promise<void> => {
  try {
    const res = await fetch(`${API_URL.server}/user/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
  } catch (error) {
    throw new Error('Could not set user settings');
  }
};

export const getUserSettingsQueryOption = queryOptions({
  queryKey: ['settings'],
  queryFn: getUserSettings,
  meta: {
    errorMessage: 'Error fetching user settings',
    successMessage: 'User settings fetched successfully',
  },
});

export const useSetUserSettings = () =>
  useMutation({
    mutationFn: (settings: Partial<UserSetting>) => setUserSettings(settings),
    meta: {
      invalidatesQuery: ['settings'],
      errorMessage: 'Error setting user settings',
      successMessage: 'User settings updated successfully',
    },
  });

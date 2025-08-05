import { API_URL } from '../config';
import { UserSettings } from '../../interfaces/User';

export const getUserSettings = async (): Promise<UserSettings> => {
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

export const setUserSettings = async (settings: Partial<UserSettings>): Promise<void> => {
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

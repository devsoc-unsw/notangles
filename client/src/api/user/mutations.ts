import { useMutation } from '@tanstack/react-query';
import { setUserSettings } from './routes';

import type { UserSettings } from '../types';

export const useSetUserSettings = () =>
  useMutation({
    mutationFn: (settings: Partial<UserSettings>) => setUserSettings(settings),
    meta: {
      invalidatesQuery: ['settings'],
      errorMessage: 'Error setting user settings',
      successMessage: 'User settings updated successfully',
    },
  }).mutate;

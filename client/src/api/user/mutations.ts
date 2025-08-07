import { useMutation } from '@tanstack/react-query';
import { setUserSettings } from './routes';

import type { UserSettings } from '../../interfaces/User';

export const useSetUserSettings = () =>
  useMutation({
    mutationFn: (settings: Partial<UserSettings>) => setUserSettings(settings),
    meta: {
      invalidatesQuery: ['settings'],
    },
  }).mutate;

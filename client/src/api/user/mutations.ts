import { useMutation } from '@tanstack/react-query';

import type { UserSettings } from '../../interfaces/User';
import { regenerateInviteCode, setUserSettings } from './routes';

export const useSetUserSettings = () =>
  useMutation({
    mutationFn: (settings: Partial<UserSettings>) => setUserSettings(settings),
    meta: {
      invalidatesQuery: ['settings'],
    },
  }).mutate;

export const useRegenerateInviteCode = () =>
  useMutation({
    mutationFn: regenerateInviteCode,
  });

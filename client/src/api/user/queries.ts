import { useSuspenseQuery } from '@tanstack/react-query';
import { getUserSettings } from './routes';

export const useGetUserSettingsQuery = () =>
  useSuspenseQuery({
    queryKey: ['settings'],
    queryFn: getUserSettings,
  }).data;

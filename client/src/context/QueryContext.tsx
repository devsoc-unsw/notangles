import { createContext, ReactNode, useContext } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUserSettingsQueryOption } from '../api/useUserSettings';
import type { UserSetting } from '../api/types';

const QueryContext = createContext<UserSetting>(undefined as never);

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryContextProvider = ({ children }: QueryProviderProps) => {
  const { data: settings } = useSuspenseQuery(getUserSettingsQueryOption);
  return <QueryContext.Provider value={settings}>{children}</QueryContext.Provider>;
};

export const useSettings = () => useContext(QueryContext);

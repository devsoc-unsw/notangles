import { createContext } from 'react';
export type TermDataType =
  | { term: string; termName: string; termNumber: Number; year: string; firstDayOfTerm: string }
  | undefined;
export type TermDataPromise = () => Promise<TermDataType>;
export const initialTermDataContext: TermDataType = {
  term: `T0`,
  termName: `Term 0`,
  termNumber: 0,
  year: '0000',
  firstDayOfTerm: '0000-00-00',
};

export const TermDataContext = createContext<TermDataType>(initialTermDataContext);

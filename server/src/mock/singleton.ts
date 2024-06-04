import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from './client';

jest.mock('./client', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

// https://github.com/prisma/prisma/issues/10203#issuecomment-1451897646
// Alternative to setting strictNullChecks to true (will break other code otherwsie)
export const prismaMock = prisma as unknown as DeepMockProxy<{
  [K in keyof PrismaClient]: Omit<PrismaClient[K], 'groupBy'>;
}>;

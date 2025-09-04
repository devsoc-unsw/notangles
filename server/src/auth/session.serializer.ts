import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { AuthProvider } from 'src/generated/prisma/enums';

type SessionUser = {
  id: string;
  authSubject?: string;
  authProvider?: AuthProvider;
  isGuest: boolean;
};

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: SessionUser,
    done: (err: Error | null, payload?: SessionUser) => void,
  ): void {
    // Only cache the minimal required fields in session
    done(null, {
      id: user.id,
      authSubject: user.authSubject,
      authProvider: user.authProvider,
      isGuest: user.isGuest,
    });
  }

  deserializeUser(
    payload: SessionUser,
    done: (err: Error | null, user?: SessionUser) => void,
  ): void {
    // No DB lookup — just return cached data
    done(null, payload);
  }
}

import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

/**
 * Responsible for populating the `req.user` property by serializing the user
 * object from the session.
 */
@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error, user: any) => void): any {
    done(null, user);
  }
  deserializeUser(
    payload: any,
    done: (err: Error, payload: string) => void,
  ): any {
    done(null, payload);
  }
}

import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This Guard acts as middleware that redirects the user to the login URI
 * if they are not authenticated.
 */
@Injectable()
export class LoginGuard extends AuthGuard('oidc') {
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return result;
  }
}

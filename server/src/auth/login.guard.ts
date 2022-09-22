import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

/**
 * This Guard acts as middleware that redirects the user to the login URI
 * if they are not authenticated.
 */
@Injectable()
export class LoginGuard extends AuthGuard('oidc') {
  constructor(private readonly authService: AuthService) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    // adding user data to DB if first time logging in
    await this.authService.createUser(request.user.userinfo);

    await super.logIn(request);
    return result;
  }
}

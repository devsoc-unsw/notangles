import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Request() req): string {
    if (req.user) {
      return (
        'Hello, ' + req.user.userinfo.name + '! <a href="/logout">Logout</a>'
      );
    } else {
      return this.appService.getHello() + ' <a href="/login">Login</a>';
    }
  }
}

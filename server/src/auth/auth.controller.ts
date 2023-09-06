import { Controller, Get, Query } from '@nestjs/common';
import { AuthDto } from './dtos';

@Controller('auth')
export class AuthController {

  @Get('login') 
  logUser(): string { 
    return 'user login event';
  }

  @Get('token')
  exchangeAuthToken(@Query() params: AuthDto): string {
    return JSON.stringify({code: params.code, state: params.state});
  }



  @Get('logout')
  logoutUser(): string {
    return 'user invalidated!';
  }
  
}

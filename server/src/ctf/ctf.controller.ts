import { Controller, Post, Body } from '@nestjs/common';
import { CtfService } from './ctf.service';

@Controller('ctf')
export class CtfController {
  constructor(private readonly ctfService: CtfService) {}

  @Post('validate')
  validateCTFConfig(@Body('localstorage') localStorage: any) {
    try {
      const isValid = this.ctfService.validateCTFConfig(localStorage);

      return {
        status: isValid
          ? 'CTF configuration is valid'
          : 'CTF configuration is invalid',
        data: { isValid },
      };
    } catch (error) {
      return {
        status: 'Invalid JSON format',
        error: error.message,
      };
    }
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class CtfService {
  validateCTFConfig(localStorage: string): boolean {
    const localConfig = JSON.parse(localStorage);
    console.log('Validating CTF configuration:', localConfig);
    return localConfig !== null;
  }
}

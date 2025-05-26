import { Controller, Post, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CtfService } from './ctf.service';
@Controller('ctf')
export class CtfController {
  private readonly flag: string;
  private localStorage = '';
  private collectedChunks: string[] = [];
  constructor(
    private readonly ctfService: CtfService,
    private configService: ConfigService,
  ) {
    this.flag = this.configService.get<string>('CTF_FLAG');
    if (!this.flag) {
      throw new Error('CTF_FLAG is not set in the environment variables');
    }
  }

  @Post('validate')
  async validateCTFConfigChunk(
    @Body('chunk') chunk: string,
    @Body('index') index: number,
    @Body('totalChunks') totalChunks: number,
  ) {
    try {
      this.collectedChunks[index] = chunk;
      return { status: 'Chunk received', index, totalChunks };
    } catch (error) {
      return {
        status: 'Error processing chunk',
        error: error.message,
      };
    }
  }

  @Post('validate/complete')
  validateCTFConfig(@Body('totalChunks') totalChunks: number) {
    try {
      if (this.collectedChunks.length === totalChunks) {
        this.localStorage = this.collectedChunks.join('');
        this.localStorage = atob(this.localStorage);
        this.collectedChunks = [];
      } else {
        return {
          status: 'Error',
          error: 'Not all chunks received',
        };
      }
      const isValid = this.ctfService.validateCTFConfig(this.localStorage);

      return {
        status: isValid
          ? 'CTF configuration is valid'
          : 'CTF configuration is invalid',
        data: isValid ? this.flag : null,
      };
    } catch (error) {
      return {
        status: 'Invalid JSON format',
        error: error.message,
      };
    }
  }
}

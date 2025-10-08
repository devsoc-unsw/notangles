import { Controller, Post, Body } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';

@Controller('file-upload')
export class FileUploadController {
  constructor(private fileUploadService: FileUploadService) {}

  @Post('single')
  async uploadSingle(@Body('image') image: string) {
    return await this.fileUploadService.uploadSingle(image);
  }
}

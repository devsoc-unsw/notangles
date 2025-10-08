import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FileUploadService {
  constructor(private minioClientService: UserService) {}

  async uploadSingle(image: string) {
    const uploadedImage = await this.minioClientService.uploadImage(image);

    return {
      imageUrl: uploadedImage.url,
      message: 'Successfully uploaded to MinIO',
    };
  }
}

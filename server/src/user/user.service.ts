import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserInfo, UserSettings } from './types';
import { MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';

@Injectable({})
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });
  }

  async getUserInfo(userId: string): Promise<UserInfo> {
    const data = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    return {
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      profilePictureUrl: data.profilePictureUrl ?? undefined,
      isGuest: data.isGuest,
    };
  }

  async uploadImage(image: string): Promise<{ url: string }> {
    // expected image format: data:<mime-type>;base64,<data>
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const mimeType = image.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/);

    if (!mimeType || !validMimeTypes.includes(mimeType[0])) {
      throw new Error('Invalid image mime type');
    }

    const tempFileName = Date.now().toString();
    const hash = crypto.createHash('md5');
    hash.update(tempFileName);
    const hashedFileName = hash.digest('hex');
    const fileName = hashedFileName;

    const bucketName = process.env.MINIO_BUCKET_NAME;

    try {
      await this.minio.client.bucketExists(bucketName!);
    } catch (err) {
      throw new Error('Error checking if bucket exists: ' + err);
    }

    try {
      await this.minio.client.putObject(bucketName!, fileName, image);
    } catch (err) {
      throw new Error('Error uploading file to MinIO: ' + err);
    }

    return {
      url: `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${fileName}`,
    };
  }

  async setProfilePicture(
    userId: string,
    profilePictureUrl: string,
  ): Promise<void> {
    const data = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        profilePictureUrl: true,
      },
    });

    const bucketName = process.env.MINIO_BUCKET_NAME;
    const fullUrl = data.profilePictureUrl;
    const temp = fullUrl?.lastIndexOf('/');
    const fileName = fullUrl?.substring(temp! + 1);

    if (data.profilePictureUrl) {
      try {
        await this.minio.client.removeObject(bucketName!, fileName!);
      } catch (err) {
        throw new Error('Error removing object from MinIO: ' + err);
      }
    }

    if (!profilePictureUrl) {
      // empty string is passed in, set the field to null (client will show the default image)
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          profilePictureUrl: '',
        },
      });
      return;
    }

    const minioImageLink = await this.uploadImage(profilePictureUrl);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profilePictureUrl: minioImageLink.url,
      },
    });
  }

  async getSettings(userId: string): Promise<UserSettings> {
    const data = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        settings: true,
      },
    });

    if (!data.settings) {
      throw new Error('User settings not found');
    }

    return data.settings;
  }

  async setSettings(userId: string, settings: UserSettings): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        settings: {
          update: settings,
        },
      },
    });
  }
}

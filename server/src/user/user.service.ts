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
    };
  }

  async uploadImage(image: string): Promise<{ url: string }> {
    // Basic base64 string validation (does not check for file type)
    const base64regex =
      /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

    if (!base64regex.test(image)) {
      throw new Error('Invalid string');
    }

    const temp_filename = Date.now().toString();
    const hash = crypto.createHash('md5');
    hash.update(temp_filename);
    const hashedFileName = hash.digest('hex');
    const filename = hashedFileName;

    const buffer = Buffer.from(image, 'base64');

    const bucketName = process.env.MINIO_BUCKET_NAME;

    try {
      await this.minio.client.putObject(bucketName!, filename, buffer);
    } catch (err) {
      throw new Error('Error uploading file to MinIO: ' + err);
    }

    return {
      url: `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${filename}`,
    };
  }

  async setProfilePicture(
    userId: string,
    profilePictureUrl: string,
  ): Promise<void> {
    if (!profilePictureUrl) {
      // null is passed in, set the field to null (client will show the default image)
      await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          profilePictureUrl: null,
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
        // consider for empty string being passed in -> set to default image
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

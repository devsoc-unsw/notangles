import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Friendship } from './types';

@Injectable({})
export class FriendshipService {
  constructor(private readonly prisma: PrismaService) {}
  // async
}

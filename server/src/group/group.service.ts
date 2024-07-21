import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UserService } from 'src/user/user.service';

export enum PrismaErrorCode {
  UNIQUE_CONSTRAINT_FAILED = 'P2002',
  RECORD_NOT_FOUND = 'P2025',
}

@Injectable()
export class GroupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly user: UserService,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const {
      name,
      visibility,
      timetableIDs,
      memberIDs,
      groupAdminIDs,
      description = '',
      imageURL = '',
    } = createGroupDto;

    const data: any = { name, visibility, description, imageURL };
    try {
      const [timetables, members, admins] = await Promise.all([
        this.user.getTimetablesByIDs(timetableIDs),
        this.user.getUsersByIDs(memberIDs),
        this.user.getUsersByIDs(groupAdminIDs),
      ]);

      if (timetables.length > 0) {
        data.timetables = {
          connect: timetables.map((timetable) => ({ id: timetable.id })),
        };
      }

      if (members.length > 0) {
        data.members = {
          connect: members.map((member) => ({ userID: member.userID })),
        };
      }

      if (admins.length > 0) {
        data.groupAdmins = {
          connect: admins.map((admin) => ({ userID: admin.userID })),
        };
      }
      const group = await this.prisma.group.create({ data });

      return group;
    } catch (error) {
      if (error.code === PrismaErrorCode.UNIQUE_CONSTRAINT_FAILED) {
        throw new ConflictException('Group already exists');
      }
      throw new HttpException(
        `There was an error: ${error.message}`,
        error.status || 500,
      );
    }
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {
    try {
      const group = await this.prisma.group.update({
        where: { id },
        data: updateGroupDto,
      });
      return group;
    } catch (error) {
      if (error.code === PrismaErrorCode.RECORD_NOT_FOUND) {
        throw new NotFoundException('Group not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.group.delete({ where: { id } });
    } catch (error) {
      if (error.code === PrismaErrorCode.RECORD_NOT_FOUND) {
        throw new NotFoundException('Group not found');
      }
      throw error;
    }
  }
}

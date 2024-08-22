import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupDto } from './dto/group.dto';
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

  //TODO helper function put where? & type of resData
  async prepareGroupData(data: GroupDto) {
    const {
      name,
      visibility,
      timetableIDs,
      memberIDs,
      groupAdminIDs,
      description = '',
      imageURL = '',
    } = data;

    const resData: any = {
      name,
      visibility,
      description,
      imageURL,
      timetables: { connect: [] },
      members: { connect: [] },
    };

    console.log('prepareGroupData', memberIDs, groupAdminIDs)

    const [timetables, members, admins] = await Promise.all([
      this.user.getTimetablesByIDs(timetableIDs),
      this.user.getUsersByIDs(memberIDs),
      this.user.getUsersByIDs(groupAdminIDs),
    ]);

    if (timetables.length > 0) {
      resData.timetables = {
        connect: timetables.map((timetable) => ({ id: timetable.id })),
      };
    }

    if (members.length > 0) {
      resData.members = {
        connect: members.map((member) => ({ userID: member.userID })),
      };
    }

    if (admins.length > 0) {
      resData.groupAdmins = {
        connect: admins.map((admin) => ({ userID: admin.userID })),
      };
    }

    return resData;
  }

  async create(createGroupDto: GroupDto) {
    try {
      const data = await this.prepareGroupData(createGroupDto);
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

  async update(id: string, updateGroupDto: GroupDto) {
    console.log('group service', updateGroupDto)
    try {
      const data = await this.prepareGroupData(updateGroupDto);
      console.log('update, prepared data', data)
      const group = await this.prisma.group.update({
        where: { id },
        data,
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

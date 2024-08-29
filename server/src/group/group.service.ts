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

    // Prepare the base data
    const resData = {
      name,
      visibility,
      description,
      imageURL,
      timetables: { connect: [] },
      members: { connect: [] },
      groupAdmins: { connect: [] },
    };

    // Fetch related entities
    const [timetables, memberUsers, admins] = await Promise.all([
      this.user.getTimetablesByIDs(timetableIDs),
      this.user.getUsersByIDs(memberIDs),
      this.user.getUsersByIDs(groupAdminIDs),
    ]);

    // Populate the connect arrays
    if (timetables.length > 0) {
      resData.timetables.connect = timetables.map((timetable) => ({
        id: timetable.id,
      }));
    }

    if (memberUsers.length > 0) {
      resData.members.connect = memberUsers.map((member) => ({
        userID: member.userID,
      }));
    }

    if (admins.length > 0) {
      resData.groupAdmins.connect = admins.map((admin) => ({
        userID: admin.userID,
      }));
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
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        timetables: true,
        members: true,
        groupAdmins: true,
      },
    });
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async update(id: string, updateGroupDto: GroupDto) {
    try {
      const data = await this.prepareGroupData(updateGroupDto);

      // Prepare relational fields
      const updateData = {
        name: data.name,
        visibility: data.visibility,
        description: data.description,
        imageURL: data.imageURL,
        timetables: {
          set: data.timetables.connect.map((item) => ({ id: item.id })),
        },
        members: {
          set: data.members.connect.map((item) => ({ userID: item.userID })),
        },
        groupAdmins: {
          set: data.groupAdmins.connect.map((item) => ({
            userID: item.userID,
          })),
        },
      };

      const group = await this.prisma.group.update({
        where: { id },
        data: updateData,
        include: {
          timetables: true,
          members: true,
          groupAdmins: true,
        },
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

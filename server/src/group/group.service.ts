import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGroupDto: CreateGroupDto) {
    try {
      const group = await this.prisma.group.create({
        data: createGroupDto,
      });
      return group;
    } catch (error) {
      if (error.code === 'P2002') { // Unique constraint failed
        throw new ConflictException('Group already exists');
      }
      throw error;
    }
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
    });
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
      if (error.code === 'P2025') { // Record not found
        throw new NotFoundException('Group not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.group.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') { // Record not found
        throw new NotFoundException('Group not found');
      }
      throw error;
    }
  }
}

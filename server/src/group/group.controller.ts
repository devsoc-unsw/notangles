import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupDto } from './dto/group.dto';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const group = await this.groupService.findOne(id);
    if (!group) {
      throw new NotFoundException({
        timestamp: new Date().toISOString(),
        path: `/api/group/${id}`,
        data: "Can't find group!",
      });
    }
    return {
      status: 'Success message for fetching group.',
      data: group,
    };
  }

  @Post()
  async create(@Body() createGroupDto: GroupDto) {
    try {
      const group = await this.groupService.create(createGroupDto);
      return {
        status: 'Success message for creation of group.',
        data: group,
      };
    } catch (error) {
      throw new BadRequestException({
        timestamp: new Date().toISOString(),
        path: `/api/group`,
        data: `There was an error creating the group, the error:  ${error}`,
      });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: GroupDto,
  ) {
    try {
      console.log('update', updateGroupDto)
      const group = await this.groupService.update(id, updateGroupDto);
      return {
        status: 'Success message for updating of group.',
        data: group,
      };
    } catch (error) {
      if (error.message === 'Group not found') {
        throw new NotFoundException({
          timestamp: new Date().toISOString(),
          path: `/api/group/${id}`,
          data: "Can't find group!",
        });
      } else if (error.message === 'Group already exists') {
        throw new ConflictException({
          timestamp: new Date().toISOString(),
          path: `/api/group/${id}`,
          data: 'Message detailing what went wrong. ie already exists',
        });
      }
      throw new BadRequestException({
        timestamp: new Date().toISOString(),
        path: `/api/group/${id}`,
        data: 'Message detailing what went wrong.',
      });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.groupService.remove(id);
      return {
        status: 'Success message for deletion of group.',
        data: {},
      };
    } catch (error) {
      throw new NotFoundException({
        timestamp: new Date().toISOString(),
        path: `/api/group/${id}`,
        data: error.message || 'Message detailing what went wrong.',
      });
    }
  }
}

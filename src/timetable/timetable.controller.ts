import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { Roles } from 'src/roles/roles.decorator';
import { RolesEnum } from 'src/roles/roles.enum';

@Roles(RolesEnum.ADMIN)
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Post('create')
  async create(@Body() createTimetableDto: CreateTimetableDto) {
    return await this.timetableService.create(createTimetableDto);
  }

  @Get('all')
  async findAll() {
    return await this.timetableService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.timetableService.findOne(+id);
  }

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateTimetableDto: UpdateTimetableDto,
  ) {
    await this.timetableService.update(+id, updateTimetableDto);
    return "OK";
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return await this.timetableService.remove(+id);
  }
}

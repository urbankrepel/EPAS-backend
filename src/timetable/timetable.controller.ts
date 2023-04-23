import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  CacheInterceptor,
  CacheTTL,
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { Roles } from 'src/roles/roles.decorator';
import { RolesEnum } from 'src/roles/roles.enum';

@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Roles(RolesEnum.ADMIN)
  @Post('create')
  async create(@Body() createTimetableDto: CreateTimetableDto) {
    return await this.timetableService.create(createTimetableDto);
  }

  @CacheTTL(60)
  @UseInterceptors(CacheInterceptor)
  @Get('all')
  async findAll() {
    const timetables = await this.timetableService.findAll();
    return timetables;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.timetableService.findOne(+id);
  }

  @Roles(RolesEnum.ADMIN)
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateTimetableDto: UpdateTimetableDto,
  ) {
    await this.timetableService.update(+id, updateTimetableDto);
    return 'OK';
  }

  @Roles(RolesEnum.ADMIN)
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return await this.timetableService.remove(+id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Roles } from 'src/roles/roles.decorator';
import { RolesEnum } from 'src/roles/roles.enum';

@Controller('workshop')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Roles(RolesEnum.ADMIN)
  @Post('create')
  async create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return await this.workshopService.create(createWorkshopDto);
  }

  @Get('all')
  async findAll() {
    return await this.workshopService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.workshopService.findOne(+id);
  }

  @Get('timetable/:id')
  async findWorkshopByTimetableId(@Param('id', ParseIntPipe) id: number) {
    return await this.workshopService.findWorkshopByTimetableId(+id);
  }

  @Get('copacity/:id')
  async findWorkshopByCapacity(@Param('id', ParseIntPipe) id: number) {
    return await this.workshopService.getCountAndCopacityByTimetableId(+id);
  }

  @Get('name/:name')
  async findWorkshopsByName(@Param('name') name: string) {
    return await this.workshopService.findWorkshopsByName(name);
  }


  @Roles(RolesEnum.ADMIN)
  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return await this.workshopService.update(+id, updateWorkshopDto);
  }

  @Roles(RolesEnum.ADMIN)
  @Delete('delete/:id')
  async remove(@Param('id') id: string) {
    return await this.workshopService.remove(+id);
  }
}

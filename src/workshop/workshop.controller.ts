import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Roles } from 'src/roles/roles.decorator';
import { RolesEnum } from 'src/roles/roles.enum';

@Roles(RolesEnum.ADMIN)
@Controller('workshop')
export class WorkshopController {
  constructor(private readonly workshopService: WorkshopService) {}

  @Post()
  create(@Body() createWorkshopDto: CreateWorkshopDto) {
    return this.workshopService.create(createWorkshopDto);
  }

  @Get()
  findAll() {
    return this.workshopService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workshopService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkshopDto: UpdateWorkshopDto,
  ) {
    return this.workshopService.update(+id, updateWorkshopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workshopService.remove(+id);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Workshop } from './entities/workshop.entity';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
  ) {}
  async create(createWorkshopDto: CreateWorkshopDto) {
    const timetableId = createWorkshopDto.timetableId;
    await this.workshopRepository.save({
      timetable: { id: timetableId },
      ...createWorkshopDto,
    });
    return 'OK';
  }

  async findAll() {
    return await this.workshopRepository.find();
  }

  async findOne(id: number) {
    return await this.workshopRepository.findOne({ where: { id } });
  }

  async findWorkshopByTimetableId(timetableId: number) {
    return await this.workshopRepository.find({
      where: { timetable: { id: timetableId } },
      loadEagerRelations: false,
    });
  }

  async update(id: number, updateWorkshopDto: UpdateWorkshopDto) {
    if (!id) return null;
    const updateData: any = { ...updateWorkshopDto };
    const timetableId = updateData.timetableId;
    delete updateData.timetableId;
    if (timetableId) {
      updateData.timetable = { id: timetableId };
    }
    try {
      await this.workshopRepository.update(id, updateData);
    } catch (error) {
      if (error.code === '23503') {
        throw new BadRequestException('Neveljaven id timetable');
      }
      throw new BadRequestException('Napaka pri popravljanju');
    }
    return 'OK';
  }

  async remove(id: number) {
    if (!id) return null;
    await this.workshopRepository.delete(id);
    return 'OK';
  }

  async save(workshop: Workshop) {
    return await this.workshopRepository.save(workshop);
  }

  async getCountAndCopacityByTimetableId(workshopId: number) {
    const workshop = await this.workshopRepository.findOne({
      where: { id: workshopId },
      relations: ['users'],
    });

    return {
      count: workshop.users.length,
      capacity: workshop.capacity,
    };
  }

  async findWorkshopsByName(name: string) {
    return await this.workshopRepository.find({
      where: { name: name },
      loadRelationIds: true, 
    });
  }
}

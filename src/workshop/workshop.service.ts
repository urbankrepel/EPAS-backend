import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { Workshop } from './entities/workshop.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class WorkshopService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepository: Repository<Workshop>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
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
    return await this.workshopRepository.find({
      relations: ['timetable'],
      loadEagerRelations: true,
    });
  }

  async findOne(id: number) {
    return await this.workshopRepository.findOne({
      where: { id },
      relations: ['timetable', 'leader'],
      loadEagerRelations: true,
    });
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
    const [workshop, userCount] = await Promise.all([
      this.workshopRepository.findOne({
        where: { id: workshopId },
      }),
      this.userService.getUserCount(workshopId),
    ]);

    return {
      count: userCount,
      capacity: workshop.capacity,
    };
  }

  async findWorkshopsByName(name: string) {
    const workshop = await this.workshopRepository.find({
      where: { name: name },
      relations: ['timetable'],
    });
    return workshop.map((workshop) => {
      return {
        ...workshop,
        timetable: workshop.timetable.id,
      };
    });
  }

  async findWorkshopsByLeader(leader: User) {
    const workshops = await this.workshopRepository.find({
      where: { leader: { id: leader.id } },
      relations: ['timetable'],
    });
    return workshops.map((workshop) => {
      return {
        ...workshop,
        timetable: workshop.timetable.id,
      };
    });
  }
}

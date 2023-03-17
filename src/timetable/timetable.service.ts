import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { Timetable } from './entities/timetable.entity';

@Injectable()
export class TimetableService {
  constructor(
    @InjectRepository(Timetable)
    private readonly timetableRepository: Repository<Timetable>,
  ) {}

  async create(createTimetableDto: CreateTimetableDto) {
    await this.timetableRepository.save(createTimetableDto);
    return 'OK';
  }

  async findAll() {
    return await this.timetableRepository.find();
  }

  async findOne(id: number) {
    if (!id) return null;
    return await this.timetableRepository.findOne({ where: { id } });
  }

  async update(id: number, updateTimetableDto: UpdateTimetableDto) {
    if (!id) return null;
    return await this.timetableRepository.update(
      { id },
      { ...updateTimetableDto },
    );
  }

  async remove(id: number) {
    if (!id) return null;
    return await this.timetableRepository.delete({ id });
  }
}

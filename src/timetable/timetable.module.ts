import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { Timetable } from './entities/timetable.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Timetable])],
  controllers: [TimetableController],
  providers: [TimetableService],
})
export class TimetableModule {}

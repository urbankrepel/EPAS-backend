import { Module } from '@nestjs/common';
import { WorkshopService } from './workshop.service';
import { WorkshopController } from './workshop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workshop } from './entities/workshop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workshop])],
  controllers: [WorkshopController],
  providers: [WorkshopService],
  exports: [WorkshopService],
})
export class WorkshopModule {}

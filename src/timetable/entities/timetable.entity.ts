import { Workshop } from 'src/workshop/entities/workshop.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity("timetables")
export class Timetable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @OneToMany(() => Workshop, (workshop) => workshop.timetable)
  workshops: Workshop[];
}

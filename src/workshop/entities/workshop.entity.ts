import { Timetable } from 'src/timetable/entities/timetable.entity';
import { Registration } from 'src/user/entities/registrations';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('workshops')
export class Workshop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Timetable, (timetable) => timetable.workshops, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'timetable_id' })
  timetable: Timetable;

  @OneToOne(() => Registration, { eager: false, lazy: true })
  registration: Registration;

  @Column({ type: 'int', nullable: false, default: 21 })
  capacity: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'leader_id' })
  leader: User;
}

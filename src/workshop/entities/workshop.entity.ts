import { Timetable } from 'src/timetable/entities/timetable.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
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

  @ManyToMany(() => User, (user) => user.workshops, {
    eager: true,
  })
  users: User[];

  @Column({ type: 'int', nullable: false, default: 21 })
  capacity: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'leader_id' })
  leader: User;
}

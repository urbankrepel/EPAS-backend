import { Workshop } from 'src/workshop/entities/workshop.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Workshop)
  @JoinColumn({ name: 'workshop_id' })
  workshop: Workshop;

  @Column({ type: 'boolean', default: false })
  attended: boolean;
}

import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Workshop } from 'src/workshop/entities/workshop.entity';

@Entity('registered_users_on_workshops')
export class RegisteredUsersOnWorkshops {
  @PrimaryColumn({ type: 'int' })
  user_id: number;

  @PrimaryColumn({ type: 'int' })
  workshop_id: number;

  @OneToOne(() => User)
  @JoinTable()
  user: User;

  @OneToOne(() => Workshop)
  @JoinTable()
  workshop: Workshop;

  @Column({ type: 'boolean', default: false })
  attended: boolean;
}

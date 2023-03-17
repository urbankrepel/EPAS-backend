import { RolesEnum } from 'src/roles/roles.enum';
import { Workshop } from 'src/workshop/entities/workshop.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  azureId: string;

  @Column({ type: 'enum', enum: RolesEnum })
  role: RolesEnum;

  @ManyToMany(() => Workshop, (workshop) => workshop.users)
  @JoinTable({ name: 'registered_users_on_workshops' })
  workshops: Workshop[];
}

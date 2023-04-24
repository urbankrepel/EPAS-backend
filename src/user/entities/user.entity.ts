import { RolesEnum } from 'src/roles/roles.enum';
import { Workshop } from 'src/workshop/entities/workshop.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GradeEntity } from './grade.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  azureId: string;

  @Column({ type: 'enum', enum: RolesEnum })
  role: RolesEnum;

  @ManyToMany(() => Workshop, (workshop) => workshop.users)
  @JoinTable({
    name: 'registered_users_on_workshops',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'workshop_id' },
  })
  workshops: Workshop[];

  @ManyToOne(() => GradeEntity)
  @JoinColumn({ name: 'grade_id' })
  grade: GradeEntity;
}

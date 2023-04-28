import { RolesEnum } from 'src/roles/roles.enum';
import { Workshop } from 'src/workshop/entities/workshop.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GradeEntity } from './grade.entity';
import { Registration } from './registrations';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  azureId: string;

  @Column({ type: 'enum', enum: RolesEnum })
  role: RolesEnum;

  @Column({ nullable: true, unique: true })
  code: number;

  @OneToOne(() => Registration)
  registration: Registration;

  @ManyToOne(() => GradeEntity)
  @JoinColumn({ name: 'grade_id' })
  grade: GradeEntity;
}

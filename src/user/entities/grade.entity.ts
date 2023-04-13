import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('grades')
export class GradeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

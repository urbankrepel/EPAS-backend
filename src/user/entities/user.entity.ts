import { RolesEnum } from 'src/roles/roles.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  azureId: string;

  @Column({ type: 'enum', enum: RolesEnum })
  role: RolesEnum;
}

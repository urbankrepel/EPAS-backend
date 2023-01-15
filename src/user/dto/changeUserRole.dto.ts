import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { RolesEnum } from 'src/roles/roles.enum';

export class ChangeUserRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(RolesEnum)
  role: RolesEnum;

  @IsNotEmpty()
  @IsString()
  azureId: string;
}

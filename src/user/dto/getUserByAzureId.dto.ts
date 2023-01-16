import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserByAzureIdDto {
  @IsNotEmpty()
  @IsString()
  azureId: string;
}

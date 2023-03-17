import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateWorkshopDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  timetableId: number;
}

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWorkshopDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

    @IsOptional()
    @IsNumber()
    timetableId: number;
}

import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateTimetableDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  start: String;

  @IsOptional()
  @IsString()
  end: String;
}

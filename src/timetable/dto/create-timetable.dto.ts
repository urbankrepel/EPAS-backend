import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateTimetableDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  start: String;

  @IsNotEmpty()
  @IsString()
  end: String;
}

import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendancePeriodDto {
  @ApiProperty({ example: '2025-06-01', required: true })
  @IsNotEmpty({ message: 'startDate is required' })
  @IsDateString({}, { message: 'startDate must be a valid date (YYYY-MM-DD)' })
  startDate: string;

  @ApiProperty({ example: '2025-06-30', required: true })
  @IsNotEmpty({ message: 'endDate is required' })
  @IsDateString({}, { message: 'endDate must be a valid date (YYYY-MM-DD)' })
  endDate: string;
}

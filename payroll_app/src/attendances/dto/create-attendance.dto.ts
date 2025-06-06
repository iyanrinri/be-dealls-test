import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ example: 1, required: true })
  @IsNotEmpty({ message: 'payrollPeriodId is required' })
  @IsNumber()
  payrollPeriodId: number;
  @ApiProperty({ example: '2025-06-06', required: true })
  @IsNotEmpty({ message: 'date is required' })
  @IsString({ message: 'date must be a string' })
  @IsDate()
  date: string;
}

import { IsDate, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayrollPeriodDto {
  @ApiProperty({ example: '2025-06-01', required: true })
  @IsNotEmpty({ message: 'startDate is required' })
  @IsDate({ message: 'startDate must be a valid date' })
  startDate: string;
  @ApiProperty({ example: '2025-06-30', required: true })
  @IsNotEmpty({ message: 'endDate is required' })
  @IsDate({ message: 'endDate must be a valid date' })
  endDate: string;
  @ApiProperty({ example: 'open', required: false })
  status?: string;
}

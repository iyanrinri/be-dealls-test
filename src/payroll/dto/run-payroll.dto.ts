import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RunPayrollDto {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ example: null, description: 'ID of the attendance period for which payroll is being run' })
  attendancePeriodId?: number;
}

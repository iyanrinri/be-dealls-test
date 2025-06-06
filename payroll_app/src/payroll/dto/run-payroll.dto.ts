import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RunPayrollDto {
  @IsInt()
  @ApiProperty({ example: null, description: 'ID of the attendance period for which payroll is being run' })
  attendancePeriodId?: number;
}

import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOvertimeDto {
  @IsNumber()
  @Min(0.1)
  @Max(3)
  @ApiProperty({ example: 1, required: true })
  hours: number;
}

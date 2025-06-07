import { IsNumber, IsString, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReimbursementDto {
  @IsNumber()
  @Min(0.01)
  @ApiProperty({ example: 100.5, required: true })
  amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'claim transportation fee', required: true })
  description: string;
}

import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { RunPayrollDto } from './dto/run-payroll.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @UseGuards(AdminGuard)
  @Post('run')
  @ApiBearerAuth()
  async runPayroll(@Body() dto: RunPayrollDto) {
    try {
      const result = await this.payrollService.runPayroll(dto.attendancePeriodId?.toString());
      return { message: 'Payroll processed', result };
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.BAD_REQUEST);
    }
  }
}

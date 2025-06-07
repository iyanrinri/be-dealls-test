import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus, Req,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { RunPayrollDto } from './dto/run-payroll.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @UseGuards(AdminGuard)
  @Post('run')
  @ApiBearerAuth()
  async runPayroll(
    @Req() request: Request,
    @Body() dto: RunPayrollDto
  ) {
    try {
      const reqUser = request.user ? request.user : null;
      if (!reqUser) {
        return { message: 'Unauthorized' };
      }
      const result = await this.payrollService.runPayroll(reqUser, dto.attendancePeriodId?.toString());
      return { message: 'Payroll processed', result };
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.BAD_REQUEST);
    }
  }
}

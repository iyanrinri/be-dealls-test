import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpException,
  HttpStatus, Req, Get, Query,
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { RunPayrollDto } from './dto/run-payroll.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('list')
  @ApiQuery({
    name: 'attendancePeriodId',
    type: String,
    required: false,
    description: 'The ID of the attendance period (optional)',
  })
  @ApiQuery({
    name: 'employeeId',
    type: String,
    required: false,
    description: 'The ID of the user (employee role) (optional)',
  })
  async listPayroll(
    @Req() request: Request,
    @Query('attendancePeriodId') attendancePeriodId?: string,
    @Query('employeeId') employeeId?: string
  ) {
    try {
      const reqUser = request.user ? request.user : null;
      if (!reqUser) {
        return { message: 'Unauthorized' };
      }
      const result = await this.payrollService.listPayroll({ attendancePeriodId, employeeId });
      return { message: 'Payroll list', result };
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.BAD_REQUEST);
    }
  }
}

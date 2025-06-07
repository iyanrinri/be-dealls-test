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
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const attendancePeriodId = dto.attendancePeriodId ? dto.attendancePeriodId.toString() : undefined;
      const result = await this.payrollService.runPayroll(reqUser, attendancePeriodId);
      return {
        message: 'Payroll processed',
        data: result,
      };
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
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const result = await this.payrollService.listPayroll({ attendancePeriodId, employeeId });
      return {
        message: 'Payroll list',
        data: result,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.BAD_REQUEST);
    }
  }

  @Get('payslips')
  @ApiBearerAuth()
  @ApiQuery({
    name: 'attendancePeriodId',
    type: String,
    required: false,
    description: 'The ID of the attendance period (optional)',
  })
  async getMyPayslip(
    @Req() request: Request,
    @Query('attendancePeriodId') attendancePeriodId?: string
  ) {
    try {
      const reqUser = request.user ? request.user : null;
      if (!reqUser) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      if (reqUser.role !== 'employee') {
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
      }
      const result = await this.payrollService.getEmployeePayslip(reqUser.id, attendancePeriodId);
      return {
        message: 'Payslip breakdown',
        data: result,
      };
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @Get('summary')
  @ApiQuery({
    name: 'attendancePeriodId',
    type: String,
    required: false,
    description: 'The ID of the attendance period (optional)',
  })
  async getPayslipSummary(
    @Req() request: Request,
    @Query('attendancePeriodId') attendancePeriodId?: string
  ) {
    try {
      const reqUser = request.user ? request.user : null;
      if (!reqUser) {
        return { message: 'Unauthorized' };
      }
      if (reqUser.role !== 'admin') {
        return { message: 'Forbidden' };
      }
      const result = await this.payrollService.getPayslipSummary(attendancePeriodId);
      return {
        message: 'Payslip summary',
        data: result
      };
    } catch (e) {
      throw new HttpException(e.message, e.status || HttpStatus.BAD_REQUEST);
    }
  }
}

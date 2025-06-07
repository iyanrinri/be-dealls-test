import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('attendance-periods')
  @ApiBearerAuth()
  async listAttendancePeriods(@Req() request: Request) {
    const reqUser = request.user ? request.user : null;
    if (!reqUser) {
      return { message: 'Unauthorized' };
    }
    return this.attendanceService.listAttendancePeriods();
  }
  
  @UseGuards(AdminGuard)
  @Post('attendance-period')
  @ApiBearerAuth()
  createAttendancePeriod(
    @Req() request: Request,
    @Body() createAttendancePeriodDto: CreateAttendancePeriodDto,
  ) {
    const reqUser = request.user ? request.user : null;
    if (!reqUser) {
      return { message: 'Unauthorized' };
    }
    return this.attendanceService.createAttendancePeriod(
      createAttendancePeriodDto,
      reqUser,
    );
  }

  @Post('check')
  @ApiBearerAuth()
  submitAttendance(@Req() request: Request) {
    const reqUser = request.user ? request.user : null;
    if (!reqUser) {
      return { message: 'Unauthorized' };
    }
    return this.attendanceService.submitAttendance(reqUser);
  }

  @Get('list')
  @ApiBearerAuth()
  @ApiQuery({
    name: 'attendancePeriodId',
    type: String,
    required: false,
    description: 'The ID of the attendance period (optional)',
  })
  async listAttendance(
    @Req() request: Request,
    @Query('attendancePeriodId') attendancePeriodId?: string,
  ) {
    const reqUser = request.user ? request.user : null;
    if (!reqUser) {
      return { message: 'Unauthorized' };
    }
    return this.attendanceService.listAttendance(reqUser, attendancePeriodId);
  }
}

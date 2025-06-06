import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { CreateAttendancePeriodDto } from './dto/create-attendance-period.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiBearerAuth } from '@nestjs/swagger'; // Assuming you have an admin guard

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

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
}

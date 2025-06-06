import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AttendanceService } from './attendance.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
// import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { AdminGuard } from '../auth/guards/admin.guard'; // Assuming you have an admin guard

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(AdminGuard)
  @Post('payroll-period')
  createPayrollPeriod(
    @Req() request: Request,
    @Body() createPayrollPeriodDto: CreatePayrollPeriodDto,
  ) {
    const reqUser = request.user ? request.user : null;
    if (!reqUser) {
      return { message: 'Unauthorized' };
    }
    return this.attendanceService.createPayrollPeriod(
      createPayrollPeriodDto,
      reqUser,
    );
  }

  // @UseGuards(AdminGuard)
  // @Post('submit')
  // submitAttendance(
  //   @Req() request: Request,
  //   @Body() createAttendanceDto: CreateAttendanceDto,
  // ) {
  //   const reqUser = request.user ? request.user : null;
  //   if (!reqUser) {
  //     return { message: 'Unauthorized' };
  //   }
  //   return this.attendanceService.submitAttendance(
  //     reqUser.id.toString(),
  //     createAttendanceDto,
  //   );
  // }
}

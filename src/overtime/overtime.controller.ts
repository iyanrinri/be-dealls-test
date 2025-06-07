import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReqUser } from '../common/decorators/req-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('overtime')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiBearerAuth()
  async submitOvertime(
    @ReqUser() reqUser: any,
    @Body() dto: CreateOvertimeDto,
  ) {
    const result = await this.overtimeService.submitOvertime(dto, reqUser);
    return { message: 'Overtime submitted', data: result };
  }

  @UseGuards(AuthGuard)
  @Get('list')
  @ApiBearerAuth()
  @ApiQuery({
    name: 'attendancePeriodId',
    type: String,
    required: false,
    description: 'The ID of the attendance period (optional)',
  })
  async listOvertime(
    @ReqUser() reqUser: any,
    @Query('attendancePeriodId') attendancePeriodId?: string,
  ) {
    const result = await this.overtimeService.listOvertime(reqUser, attendancePeriodId);
    return { message: 'Overtime list', data: result };
  }
}

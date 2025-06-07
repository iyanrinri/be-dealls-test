import { Controller, Get, NotFoundException, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { UsersService } from './user.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ReqUser } from '../common/decorators/req-user.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getUserInfo(@ReqUser() reqUser: any) {
    const user = await this.usersService.findOne(Number(reqUser.id));
    if (!user) throw new NotFoundException('User not found');
    return {
      message: 'User info',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        salary: user.salary,
      },
    };
  }
}

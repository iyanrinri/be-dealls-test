import { Controller, Get, Param, NotFoundException, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { UsersService } from './user.service';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  async getUserInfo(@Req() request: Request) {
    const reqUser = request.user ? request.user : null;
    if (!reqUser) {
      return { message: 'Unauthorized' };
    }
    const user = await this.usersService.findOne(Number(reqUser.id));
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

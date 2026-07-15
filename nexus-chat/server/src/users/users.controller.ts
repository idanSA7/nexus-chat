import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from './dto/register.dto';

@Controller('users') 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }
}
import { Body, Controller, Post, Delete, Patch, Get, Headers } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { FriendRequestDto } from '../dto/friendRequest.dto';

@Controller('users') 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.usersService.login(loginDto);
  }

  // 🔓 קוראים את מזהה השולח ישירות מה-Header 'x-user-id' ללא Guards!
  @Post('friendRequest')
  friendRequest(
    @Headers('x-user-id') userId: string, 
    @Body() friendRequest: FriendRequestDto
  ) {
    return this.usersService.sendFriendRequest(userId, friendRequest.targetUsername);
  }

  @Delete('deleteFriend')
  deleteFriend(
    @Headers('x-user-id') userId: string,
    @Body() deleteFriend: FriendRequestDto
  ) {
    return this.usersService.deleteFriend(userId, deleteFriend.targetUsername);
  }

  @Patch('acceptFriend')
  acceptFriend(
    @Headers('x-user-id') userId: string,
    @Body() acceptFriend: FriendRequestDto
  ) {
    return this.usersService.acceptFriendRequest(userId, acceptFriend.targetUsername);
  }

  @Get('friends')
  getFriends(@Headers('x-user-id') userId: string) {
    return this.usersService.getFriends(userId);
  }
  @Get('friendRequests/pending')
  getPendingRequests(@Headers('x-user-id') userId: string) {
    return this.usersService.getPendingRequests(userId);
  }
}
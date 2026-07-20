import { Controller, Post, Body, Patch, Param, Get, Headers } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from '../dto/createchat.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('group')
  createGroupChat(
    @Headers('x-user-id') userId: string,
    @Body() createChatDto: CreateChatDto
  ) {
    return this.chatsService.createGroupChat(
      userId,
      createChatDto.name || 'קבוצה ללא שם',
      createChatDto.members
    );
  }

  @Patch(':id/name')
  updateGroupName(
    @Headers('x-user-id') userId: string,
    @Param('id') chatId: string,
    @Body('name') newName: string
  ) {
    return this.chatsService.updateGroupName(userId, chatId, newName);
  }

  @Patch(':id/description')
  updateGroupDescription(
    @Headers('x-user-id') userId: string,
    @Param('id') chatId: string,
    @Body('description') newDescription: string
  ) {
    return this.chatsService.updateGroupDescription(userId, chatId, newDescription);
  }

  @Get(':id/members')
  getAllGroupMembers(
    @Headers('x-user-id') userId: string,
    @Param('id') chatId: string
  ) {
    return this.chatsService.getAllGroupMembers(userId, chatId);
  }

  @Patch(':id/add-member')
  addMemberToGroup(
    @Headers('x-user-id') userId: string,
    @Param('id') chatId: string,
    @Body('username') targetUsername: string
  ) {
    return this.chatsService.addMemberToGroup(userId, chatId, targetUsername);
  }

  @Patch(':id/remove-member')
  removeMemberFromGroup(
    @Headers('x-user-id') userId: string,
    @Param('id') chatId: string,
    @Body('username') targetUsername: string
  ) {
    return this.chatsService.removeMemberFromGroup(userId, chatId, targetUsername);
  }

  @Get('private/:username')
  getOrCreatePrivateChat(
    @Headers('x-user-id') userId: string,
    @Param('username') username: string
  ) {
    return this.chatsService.findOrCreatePrivateChat(userId, username);
  }
}
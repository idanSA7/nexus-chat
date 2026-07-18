import { Controller, Post, Get, Body, Param, Headers } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from '../dto/createmessage.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  createMessage(
    @Headers('x-user-id') userId: string,
    @Body() createMessageDto: CreateMessageDto
  ) {
    return this.messagesService.createMessage(
      userId,
      createMessageDto.chatId,
      createMessageDto.content
    );
  }

  @Get(':chatId')
  getChatMessages(
    @Headers('x-user-id') userId: string,
    @Param('chatId') chatId: string
  ) {
    return this.messagesService.getChatMessages(userId, chatId);
  }
}
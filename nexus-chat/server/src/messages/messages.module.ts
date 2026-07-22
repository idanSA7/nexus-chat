import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './message.gateway';
import { Message, MessageSchema } from './schemas/message.schema';
import { Chat, ChatSchema } from '../chats/schemas/chat.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ChatsModule } from '../chats/chats.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema }
      
      
    ]),
    ChatsModule
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
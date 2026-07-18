import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message, MessageSchema } from './schemas/message.schema';
import { Chat, ChatSchema } from '../chats/schemas/chat.schema';
import { User, UserSchema } from '../users/schemas/user.schema'; // ייבוא סכמת המשתמשים!

@Module({
  imports: [
    // רישום כל 3 הסכמות הדרושות לסרוויס של ההודעות!
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService]
})
export class MessagesModule {}
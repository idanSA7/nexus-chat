import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { User, UserSchema } from '../users/schemas/user.schema'; // ייבוא סכמת המשתמש לצורך קישור ה-populate
import { ChatsGateway } from './chats.gateway';

@Module({
  imports: [
    // רישום שתי הסכמות בתוך המודול הנוכחי כדי ש-ChatsService יוכל להשתמש בהן
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
  exports: [ChatsService]
})
export class ChatsModule {}
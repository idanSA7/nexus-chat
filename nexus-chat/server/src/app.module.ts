import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
@Module({
  imports: [
    // פה מחברים את בסיס הנתונים פעם אחת לכל האפליקציה!
    MongooseModule.forRoot('mongodb://localhost:27017/nexus-chat'),
    UsersModule,  // מייבאים את המודול של היוזרים
    AuthModule, ChatsModule, MessagesModule 
  ],
})
export class AppModule {}
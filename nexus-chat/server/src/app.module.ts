import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/nexus-chat'),
    
    UsersModule,
    AuthModule,
    ChatsModule,
    MessagesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
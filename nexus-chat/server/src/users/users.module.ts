import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller'; 
import { UsersService } from './users.service';       
import { User, UserSchema } from './schemas/user.schema';
import { Friendship, FriendshipSchema } from './schemas/friendship.schema';
import { AuthModule } from '../auth/auth.module'; // מייבאים את מודול האבטחה בצורה נקייה וישרה

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Friendship.name, schema: FriendshipSchema }
        ]),
        AuthModule // לא רלוונטי
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
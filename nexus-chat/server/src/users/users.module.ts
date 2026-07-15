import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller'; 
import { UsersService } from './users.service';       
import { User, UserSchema } from './schemas/user.schema';

@Module({
    imports: [
        // הוסף כאן את ה-Connection string שלך למערך ה-imports
        MongooseModule.forRoot('mongodb+srv://idansalhani_db_user:PcYmyCmxzzPl7hoj@cluster0.esxjzep.mongodb.net/nexus-chat?retryWrites=true&w=majority'),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
    ],
    controllers: [UsersController],
    providers: [UsersService],
})
export class AppModule {}
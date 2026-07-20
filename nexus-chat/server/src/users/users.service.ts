import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { Friendship } from './schemas/friendship.schema';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Friendship.name) private friendshipModel: Model<Friendship>
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, password } = registerDto;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new this.userModel({
      username,
      password: hashedPassword,
    });

    try {
      return await newUser.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {                                                    
    }

    return { 
      message: 'Login successful', 
      username: user.username,
      userId: user._id.toString() 
    };
  }

  async sendFriendRequest(senderId: string, targetUsername: string) {
    const receiver = await this.userModel.findOne({ username: targetUsername });
    if (!receiver) {
      throw new ConflictException('User not found');
    }

    if (receiver._id.toString() === senderId) {
      throw new ConflictException('You cannot send a friend request to yourself');
    }

    const newRequest = new this.friendshipModel({
      sendingUser: new Types.ObjectId(senderId),
      receivingUser: receiver._id,
      status: 'pending'
    });

    try {
      return await newRequest.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Friend request already exists');
      }
      throw error;
    }
  }

  async deleteFriend(senderId: string, targetUsername: string) {
    const targetUser = await this.userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      throw new ConflictException('User not found');
    }

    const deletedFriendship = await this.friendshipModel.findOneAndDelete({
      $or: [
        { sendingUser: new Types.ObjectId(senderId), receivingUser: targetUser._id },
        { sendingUser: targetUser._id, receivingUser: new Types.ObjectId(senderId) }
      ]
    });

    if (!deletedFriendship) {
      throw new ConflictException('Friendship connection does not exist');
    }

    return { message: `Friendship with ${targetUsername} deleted successfully` };
  }

  async addFriendDirectly(senderId: string, targetUsername: string) {
    const receiver = await this.userModel.findOne({ username: targetUsername });
    if (!receiver) {
      throw new ConflictException('User not found');
    }

    if (receiver._id.toString() === senderId) {
      throw new ConflictException('You cannot add yourself as a friend');
    }

    const senderObjectId = new Types.ObjectId(senderId);
    const receiverObjectId = receiver._id as Types.ObjectId;

    const existingFriendship = await this.friendshipModel.findOne({
      $or: [
        { sendingUser: senderObjectId, receivingUser: receiverObjectId },
        { sendingUser: receiverObjectId, receivingUser: senderObjectId }
      ]
    });

    if (existingFriendship) {
      throw new ConflictException('You are already friends with this user');
    }

    
    const newFriendship = new this.friendshipModel({
      sendingUser: senderObjectId,
      receivingUser: receiverObjectId,
      status: 'accepted' 
    });

    try {
      await newFriendship.save();
      return { message: `You are now friends with ${targetUsername}` };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Friendship already exists');
      }
      throw error;
    }
  }
/*
  async acceptFriendRequest(myUserId: string, targetUsername: string) {
    console.log('=== תחילת בדיקת אישור חברות ===');
    console.log('1. המשתמש המחובר ב-Header (מי שאמור לאשר):', myUserId);
    console.log('2. ה-targetUsername שהתקבל ב-Body:', targetUsername);

    const targetUser = await this.userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      console.log(' שגיאה: לא נמצא משתמש ב-DB עם השם:', targetUsername);
      throw new ConflictException('User not found');
    }

    console.log('3. המשתמש ששלח את הבקשה נמצא ב-DB. ה-ID שלו הוא:', targetUser._id.toString());

    const targetUserObjectId = new Types.ObjectId(targetUser.id);
    const myUserObjectId = new Types.ObjectId(myUserId);

    console.log('4. מריץ שאילתה במונגו עם הערכים הבאים:');
    console.log(`סטטוס: pending`);
    console.log(`sendingUser (ObjectId): ${targetUserObjectId}`);
    console.log(`receivingUser (ObjectId): ${myUserObjectId}`);

    const pendingRequest = await this.friendshipModel.findOne({
      status: 'pending',
      $or: [
        { sendingUser: targetUserObjectId, receivingUser: myUserObjectId },
        { sendingUser: targetUser.id, receivingUser: myUserId }
      ]
    });

    if (!pendingRequest) {
      console.log(' שגיאה: מונגו לא מצא שום רשומה מתאימה בטבלת friendships!');
      console.log('=== סוף בדיקת אישור חברות ===');
      throw new ConflictException('No pending friend request found between users');
    }

    console.log(' הצלחה! הבקשה נמצאה. מעדכן ל-accepted...');
    pendingRequest.status = 'accepted';
    await pendingRequest.save();

    console.log('=== סוף בדיקת אישור חברות ===');
    return { message: `Friend request from ${targetUsername} accepted successfully` };
  }
*/
  async getFriends(myUserId: string) {
    const myUserObjectId = new Types.ObjectId(myUserId);
    const friendships = await this.friendshipModel
      .find({
        status: 'accepted',
        $or: [
          { receivingUser: myUserObjectId },
          { sendingUser: myUserObjectId }
        ]
      })
      .populate('sendingUser receivingUser');

    return friendships.map(friendship => {
      const sender = friendship.sendingUser ;
      const receiver = friendship.receivingUser ;
      return sender._id.toString() === myUserId ? receiver : sender;
    });
  }

 
  async getPendingRequests(myUserId: string) {
    return this.friendshipModel
      .find({
        $or: [
          { receivingUser: myUserId },
          { recivingUser: myUserId }
        ],
        status: 'pending'
      } )
      .populate('sendingUser', 'username');

  } 


}
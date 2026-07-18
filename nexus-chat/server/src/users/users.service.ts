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
      throw new UnauthorizedException('Invalid credentials');
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

  // 🤝 אישור בקשת החברות באמצעות מעקף הדרייבר הישיר של מונגו!
  async acceptFriendRequest(myUserId: string, targetUsername: string) {
    const targetUser = await this.userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      throw new ConflictException('User not found');
    }

    // מגדירים את מזהי המשתמשים בכל הפורמטים האפשריים (ObjectId ו-String)
    const myUserObjectId = new Types.ObjectId(myUserId);
    const targetUserObjectId = targetUser._id instanceof Types.ObjectId 
      ? targetUser._id 
      : new Types.ObjectId(targetUser._id as string);

    const allowedMyUserIds = [myUserObjectId, myUserId, myUserId.toString()];
    const allowedTargetUserIds = [targetUserObjectId, targetUser._id, targetUser._id.toString()];

    // 🚀 פנייה ישירה לדרייבר הגולמי של MongoDB (עוקף את מנגנון Strict Schema של Mongoose!)
    const rawPendingRequest = await this.friendshipModel.collection.findOne({
      status: 'pending',
      $or: [
        // בודק את כל השילובים האפשריים של השדות (כולל שגיאת הכתיב הישנה recivingUser ב-DB!)
        {
          sendingUser: { $in: allowedTargetUserIds },
          receivingUser: { $in: allowedMyUserIds }
        },
        {
          sendingUser: { $in: allowedTargetUserIds },
          recivingUser: { $in: allowedMyUserIds }
        },
        {
          sendingUser: { $in: allowedMyUserIds },
          receivingUser: { $in: allowedTargetUserIds }
        },
        {
          sendingUser: { $in: allowedMyUserIds },
          recivingUser: { $in: allowedTargetUserIds }
        }
      ]
    } as any);

    if (!rawPendingRequest) {
      throw new ConflictException('No pending friend request found between users');
    }

    // 🎉 נמצא המסמך הגולמי! נעדכן אותו ישירות ב-Database
    await this.friendshipModel.collection.updateOne(
      { _id: rawPendingRequest._id },
      { $set: { status: 'accepted' } }
    );

    return { message: `Friend request from ${targetUsername} accepted successfully` };
  }

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
      const sender = friendship.sendingUser as any;
      const receiver = friendship.receivingUser as any;
      return sender._id.toString() === myUserId ? receiver : sender;
    });
  }

  async getPendingRequests(myUserId: string) {
    const myUserObjectId = new Types.ObjectId(myUserId);
    
    // שליפה גמישה גם של בקשות ישנות התומכת בשגיאת הכתיב הגולמית
    const pendingFriendships = await this.friendshipModel
      .find({
        $or: [
          { receivingUser: myUserObjectId },
          { recivingUser: myUserObjectId }
        ],
        status: 'pending'
      } as any)
      .populate('sendingUser', 'username');

    return pendingFriendships
      .map(f => f.sendingUser)
      .filter(u => u !== null && u !== undefined);
  }
}
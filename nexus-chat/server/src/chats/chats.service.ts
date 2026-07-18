import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './schemas/chat.schema';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  async createGroupChat(myUserId: string, name: string, memberUsernames: string[]) {
   
    const users = await this.userModel.find({
      username: { $in: memberUsernames }
    });

    if (users.length === 0) {
      throw new NotFoundException('No valid users found to add to the group');
    }

    const memberIds = users.map(user => user._id.toString());

    if (!memberIds.includes(myUserId)) {
      memberIds.push(myUserId);
    }

    const newGroup = new this.chatModel({
      name: name || 'קבוצה ללא שם',
      type: 'group',
      members: memberIds
    });

    const savedGroup = await newGroup.save();
    return savedGroup.populate('members', 'username');
  }
async updateGroupName(myUserId: string, chatId: string, newName: string) {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== 'group') {
      throw new ConflictException('You cannot set a name for a private chat');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this group');
    }

    chat.name = newName;
    const updatedChat = await chat.save();
    return updatedChat.populate('members', 'username');
  }
  async updateGroupDescription(myUserId: string, chatId: string, newDescription: string) {
    // 1. נחפש את השיחה ב-DB
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // 2. אבטחה: נוודא שזה צ'אט קבוצתי ולא שיחה פרטית
    if (chat.type !== 'group') {
      throw new ConflictException('You cannot set a description for a private chat');
    }

    // 3. אבטחה: נוודא שהמשתמש שמנסה לשנות את התיאור הוא חבר בקבוצה
    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this group');
    }

    // 4. נעדכן את התיאור ונשמור
    chat.description = newDescription;
    const updatedChat = await chat.save();
    return updatedChat.populate('members', 'username');
  }
 async getAllGroupMembers(myUserId: string, chatId: string) {
    // 1. נחפש את השיחה ב-DB
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this group');
    }

    // 3. נפעיל את ה-populate כדי לתרגם את ה-IDs לאובייקטי משתמש אמיתיים עם שמות
    const populatedChat = await chat.populate('members', 'username');
    
    // נחזיר ישירות רק את מערך המשתמשים המלא
    return populatedChat.members;
  }
    async DeleteMember(myUserId: string, chatId: string, targetUsername: string){
      const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this group');
    }
   
  const targetUser = await this.userModel.findOne({ username: targetUsername });
  if (!targetUser) {
    throw new NotFoundException(`User '${targetUsername}' not found`);
  }


  const isTargetInGroup = chat.members!.some(memberId => memberId.toString() === targetUser._id.toString());
  if (!isTargetInGroup) {
    throw new ConflictException(`User '${targetUsername}' is not a member of this group`);
  }

  (chat.members as any).pull(targetUser._id);

  const updatedChat = await chat.save();
  return updatedChat.populate('members', 'username');  
}
  async addMemberToGroup(myUserId: string, chatId: string, targetUsername: string) {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== 'group') {
      throw new ConflictException('You can only add members to a group chat');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You must be a member of the group to add others');
    }

    const targetUser = await this.userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      throw new NotFoundException(`User '${targetUsername}' not found`);
    }

    const targetUserIdStr = targetUser._id.toString();

    const isAlreadyInGroup = chat.members!.some(memberId => memberId.toString() === targetUserIdStr);
    if (isAlreadyInGroup) {
      throw new ConflictException(`User '${targetUsername}' is already a member of this group`);
    }

    chat.members!.push(targetUser._id as any);
    const updatedChat = await chat.save();
    return updatedChat.populate('members', 'username');
  }

  // ➖ הסרת משתמש מקבוצה קיימת (גרסה מקצועית עם pull)
  async removeMemberFromGroup(myUserId: string, chatId: string, targetUsername: string) {
    // 1. נחפש את הקבוצה ב-DB
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // 2. אבטחה: נוודא שזהו צ'אט קבוצתי
    if (chat.type !== 'group') {
      throw new ConflictException('You can only remove members from a group chat');
    }

    // 3. אבטחה: נוודא שאתה חבר בקבוצה בעצמך כדי שיהיה מותר לך להסיר אנשים
    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You must be a member of the group to remove others');
    }

    // 4. נתרגם את ה-username של המטרה ל-ID אמיתי מה-DB
    const targetUser = await this.userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      throw new NotFoundException(`User '${targetUsername}' not found`);
    }

    // 5. בדיקה: נוודא שהמשתמש שרוצים להסיר אכן חבר בקבוצה כרגע
    const isTargetInGroup = chat.members!.some(memberId => memberId.toString() === targetUser._id.toString());
    if (!isTargetInGroup) {
      throw new ConflictException(`User '${targetUsername}' is not a member of this group`);
    }

    // 6. הקסם של מונגוס! מחיקה אמינה ומהירה מהמערך בשורה אחת:
    (chat.members as any).pull(targetUser._id);

    // 7. שומרים ומחזירים את הרשימה המעודכנת
    const updatedChat = await chat.save();
    return updatedChat.populate('members', 'username');
  }
}

  

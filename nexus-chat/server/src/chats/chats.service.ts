import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

    const ObjectIds = memberIds.map(id => new Types.ObjectId(id));

    const newGroup = new this.chatModel({
      name: name || 'קבוצה ללא שם',
      type: 'group',
      members: ObjectIds
    });

    const savedGroup = await newGroup.save();
    return savedGroup.populate('members', 'username');
  }

  async updateGroupName(myUserId: string, chatId: string, newName: string) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException('Chat not found (Invalid ID format)');
    }

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
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException('Chat not found (Invalid ID format)');
    }

    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== 'group') {
      throw new ConflictException('You cannot set a description for a private chat');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this group');
    }

    chat.name = chat.name; 
    const updatedChat = await chat.save();
    return updatedChat.populate('members', 'username');
  }

  async getAllGroupMembers(myUserId: string, chatId: string) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException('Chat not found (Invalid ID format)');
    }

    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this group');
    }

    const populatedChat = await chat.populate('members', 'username');
    return populatedChat.members;
  }

  async addMemberToGroup(myUserId: string, chatId: string, targetUsername: string) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException('Chat not found (Invalid ID format)');
    }

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

    const isAlreadyInGroup = chat.members!.some(memberId => memberId.toString() === targetUser._id.toString());
    if (isAlreadyInGroup) {
      throw new ConflictException(`User '${targetUsername}' is already in this group`);
    }

    chat.members!.push(targetUser._id as any);
    const updatedChat = await chat.save();
    return updatedChat.populate('members', 'username');
  }




 async findOrCreatePrivateChat(myUserId: string, targetUsername: string) {
    const targetUser = await this.userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const myUserIdObj = new Types.ObjectId(myUserId);
    const targetUserIdObj = targetUser._id as Types.ObjectId;

    let chat = await this.chatModel.findOne({
      type: 'private',
      members: { $all: [myUserIdObj, targetUserIdObj] }
    });

    if (!chat) {
      chat = await new this.chatModel({
        type: 'private',
        members: [myUserIdObj, targetUserIdObj]
      }).save();
    }

    return chat.populate('members', 'username');
  }

  async removeMemberFromGroup(myUserId: string, chatId: string, targetUsername: string) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException('Chat not found (Invalid ID format)');
    }

    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== 'group') {
      throw new ConflictException('You can only remove members from a group chat');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You must be a member of the group to remove others');
    }

    const targetUser = await this.userModel.findOne({ username: targetUsername });
    if (!targetUser) {
      throw new NotFoundException(`User '${targetUsername}' not found`);
    }

    const isTargetInGroup = chat.members!.some(memberId => memberId.toString() === targetUser._id.toString());
    if (!isTargetInGroup) {
      throw new ConflictException(`User '${targetUsername}' is not in this group`);
    }

    (chat.members as any).pull(targetUser._id);
    const updatedChat = await chat.save();
    return updatedChat.populate('members', 'username');
  }
}
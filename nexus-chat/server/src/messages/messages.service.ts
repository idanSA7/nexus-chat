import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from '../chats/schemas/chat.schema';
import { User } from '../users/schemas/user.schema';
import { Message } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Message.name) private messageModel: Model<Message>
  ) {}

  async createMessage(myUserId: string, chatId: string, content: string) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException('Chat not found (Invalid ID format)');
    }

    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this chat');
    }

    const newMessage = new this.messageModel({
      sendingUser: new Types.ObjectId(myUserId),
      receivingChat: new Types.ObjectId(chatId),
      content: content
    });

    const savedMessage = await newMessage.save();
    return savedMessage.populate('sendingUser', 'username');
  }

  async getChatMessages(myUserId: string, chatId: string) {
    if (!Types.ObjectId.isValid(chatId)) {
      throw new NotFoundException('Chat not found (Invalid ID format)');
    }

    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this chat');
    }

    return this.messageModel
      .find({ receivingChat: new Types.ObjectId(chatId) })
      .sort({ createdAt: 1 })
      .populate('sendingUser', 'username');
  }
}
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from '../chats/schemas/chat.schema';
import { User } from '../users/schemas/user.schema';
import { Message } from './schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    // הזרקת המודל של הצ'אטים (כדי לבדוק שהצ'אט קיים והמשתמש חבר בו)
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    // הזרקת המודל של המשתמשים
    @InjectModel(User.name) private userModel: Model<User>,
    // תיקנו את ההזרקה שתפנה למודל ההודעות הנכון!
    @InjectModel(Message.name) private messageModel: Model<Message>
  ) {}

  // ✉️ יצירה ושליחה של הודעה חדשה
  async createMessage(myUserId: string, chatId: string, content: string) {
    // 1. נחפש את הצ'אט בבסיס הנתונים
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // 2. אבטחה: נוודא שסהר (השולח) הוא אכן חבר בקבוצה/בצ'אט הזה
    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this chat');
    }

    const newMessage = new this.messageModel({
      sendingUser: myUserId,     // מי ששולח
      receivingChat: chatId,     // הצ'אט שמקבל
      content: content           // תוכן הטקסט
    });

    // 4. נשמור בבסיס הנתונים ונחזיר את ההודעה המלאה עם שם השולח (populate)
    const savedMessage = await newMessage.save();
    return savedMessage.populate('sendingUser', 'username');
  }

  // 📜 שליפת היסטוריית ההודעות של צ'אט ספציפי
  async getChatMessages(myUserId: string, chatId: string) {
    // 1. נחפש את הצ'אט ב-DB
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // 2. אבטחה: נוודא שהמשתמש שמנסה לקרוא את ההודעות באמת חבר בצ'אט הזה
    const isMember = chat.members!.some(memberId => memberId.toString() === myUserId);
    if (!isMember) {
      throw new ConflictException('You are not a member of this chat');
    }

    // 3. נשלוף את כל ההודעות השייכות לצ'אט הזה, ונמיין מהישנה ביותר לחדשה ביותר (כרונולוגי)
    return this.messageModel
      .find({ receivingChat: chatId })
      .sort({ createdAt: 1 }) // 1 = מיין לפי סדר עולה (מהישן לחדש)
      .populate('sendingUser', 'username');
  }
}
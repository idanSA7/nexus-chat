import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) 
export class Message extends Document {
  
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sendingUser!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  receivingChat!: Types.ObjectId;

  @Prop({ required: true })
  content!: string;


  @Prop({ type: Date, default: Date.now, expires: 43200 })
  createdAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
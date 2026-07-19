import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ required: false })
  name?: string; 

  @Prop({ required: true, enum: ['private', 'group'] })
  type?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  members?: Types.ObjectId[];
  
  @Prop({ required: false })
  description?: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

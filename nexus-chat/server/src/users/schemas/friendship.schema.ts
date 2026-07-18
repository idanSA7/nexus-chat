import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Friendship extends Document {
  
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sendingUser!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receivingUser!: Types.ObjectId;

  @Prop({ required: true, enum: ['pending', 'accepted', 'blocked'] })
  status!: string;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

//1= סדר עולה בדאטא בייס
FriendshipSchema.index({ sendingUser: 1, receivingUser: 1 }, { unique: true });
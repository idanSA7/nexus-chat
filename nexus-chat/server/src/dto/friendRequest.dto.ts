import { IsString, IsNotEmpty } from 'class-validator';

export class FriendRequestDto {
  @IsString()
  @IsNotEmpty()
  targetUsername!: string; 
}
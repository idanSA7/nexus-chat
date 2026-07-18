import { IsString, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  // תוכן ההודעה (הטקסט שהמשתמש הקליד בצ'אט)
  @IsString()
  @IsNotEmpty({ message: 'Message content cannot be empty' })
  content!: string;

  // ה-ID של הצ'אט שאליו ההודעה משויכת (פרטי או קבוצתי)
  @IsString()
  @IsNotEmpty({ message: 'chatId is required' })
  chatId!: string;
}
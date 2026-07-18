import { IsString, IsArray, IsOptional, ArrayMinSize } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1) 
  members!: string[];

  
}
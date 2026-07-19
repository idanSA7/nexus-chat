import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from '../dto/createmessage.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway {
  
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log(` new customer logged in: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(` client disconnected : ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
async handleSendMessage(
  @ConnectedSocket() client: Socket,
  @MessageBody() createMessageDto: CreateMessageDto
) {
  // כאן אנחנו מחלצים את ה-ID מה-Header של ה-Handshake של ה-Socket!
  const myUserId = client.handshake.headers['x-user-id'] as string;

  if (!myUserId) {
    console.error(' הודעה נשלחה ללא זיהוי משתמש (No Header)!');
    return;
  }

  console.log('✉️ התקבלה הודעה חדשה בווב-סוקט של השרת:', createMessageDto);

  try {
    const savedMessage = await this.messagesService.createMessage(
      myUserId, 
      createMessageDto.chatId,
      createMessageDto.content
    );

    this.server.emit('messageReceived', savedMessage);
    
  } catch (error) {
    console.error('שגיאה בשמירת הודעה דרך הווב-סוקט:', error);
  }
}
}
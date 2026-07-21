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
    console.log(` client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(` client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string
  ) {
    if (chatId) {
      client.join(chatId);
      console.log(` Client ${client.id} joined room: ${chatId}`);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatId: string
  ) {
    if (chatId) {
      client.leave(chatId);
      console.log(` Client ${client.id} left room: ${chatId}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto
  ) {
    const myUserId = client.handshake.headers['x-user-id'] as string;

    if (!myUserId) {
      console.error(' הודעה נשלחה ללא זיהוי משתמש (No Header)!');
      return;
    }

    try {
      const savedMessage = await this.messagesService.createMessage(
       myUserId, 
       createMessageDto.chatId, 
       createMessageDto.content
);

      const chatId = savedMessage.receivingChat.toString();
      this.server.to(chatId).emit('messageReceived', savedMessage);
      
    } catch (error) {
      console.error(' שגיאה בשמירת הודעה דרך הווב-סוקט:', error);
    }
  }
}
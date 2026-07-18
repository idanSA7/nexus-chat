import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  handleConnection(client: Socket) {
    console.log(`📡 WebSocket: Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`📡 WebSocket: Client disconnected: ${client.id}`);
  }
}
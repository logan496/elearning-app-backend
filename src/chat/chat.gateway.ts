// src/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Map userId -> Set<socketId> pour supporter plusieurs connexions
  private connectedUsers: Map<number, Set<string>> = new Map();
  // Map socketId -> userId pour la déconnexion
  private socketToUser: Map<string, number> = new Map();

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        console.log('❌ No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const userId = payload.id;

      // Associer l'utilisateur au socket
      client.data.userId = userId;

      // Ajouter le socket à l'ensemble des sockets de l'utilisateur
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }

      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        userSockets.add(client.id);
        this.socketToUser.set(client.id, userId);

        console.log(
          `✅ User ${userId} connected with socket ${client.id} (${userSockets.size} active connections)`,
        );
      }

      // Notifier les autres utilisateurs
      this.server.emit('user:connected', { userId });
    } catch (error) {
      console.error('❌ Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);

    if (userId !== undefined) {
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);

        // Si c'était la dernière connexion de l'utilisateur
        if (userSockets.size === 0) {
          this.connectedUsers.delete(userId);
          console.log(`❌ User ${userId} fully disconnected`);
          this.server.emit('user:disconnected', { userId });
        } else {
          console.log(`🔌 User ${userId} disconnected one socket (${userSockets.size} remaining)`);
        }
      }

      this.socketToUser.delete(client.id);
    }
  }

  @SubscribeMessage('message:general')
  async handleGeneralMessage(
    @MessageBody() data: { content: string; tempId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.chatService.sendGeneralMessage(
        userId,
        data.content,
      );

      if (!message || !message.sender) {
        return { error: 'Failed to save message' };
      }

      // Préparer le payload avec tempId si fourni
      const messageData = {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: {
          id: message.sender.id,
          username: message.sender.username,
          avatar: message.sender.avatar,
        },
        ...(data.tempId && { tempId: data.tempId }),
      };

      // Émettre à tous les clients (y compris l'expéditeur pour confirmation)
      this.server.emit('message:general:new', messageData);

      return { success: true, message: messageData };
    } catch (error) {
      console.error('❌ Error sending general message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('message:direct')
  async handleDirectMessage(
    @MessageBody() data: { recipientId: number; content: string; tempId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;

    if (!senderId) {
      return { error: 'Unauthorized' };
    }

    try {
      const message = await this.chatService.sendDirectMessage(
        senderId,
        data.recipientId,
        data.content,
      );

      if (!message || !message.sender || !message.recipient) {
        return { error: 'Failed to save message or user not found' };
      }

      const messageData = {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        sender: {
          id: message.sender.id,
          username: message.sender.username,
          avatar: message.sender.avatar,
        },
        recipient: {
          id: message.recipient.id,
          username: message.recipient.username,
        },
        ...(data.tempId && { tempId: data.tempId }),
      };

      // Envoyer au destinataire (toutes ses connexions)
      const recipientSockets = this.connectedUsers.get(data.recipientId);
      if (recipientSockets && recipientSockets.size > 0) {
        recipientSockets.forEach(socketId => {
          this.server.to(socketId).emit('message:direct:new', messageData);
        });
      }

      // Confirmer à l'expéditeur (toutes ses connexions)
      const senderSockets = this.connectedUsers.get(senderId);
      if (senderSockets && senderSockets.size > 0) {
        senderSockets.forEach(socketId => {
          this.server.to(socketId).emit('message:direct:sent', messageData);
        });
      }

      return { success: true, message: messageData };
    } catch (error) {
      console.error('❌ Error sending direct message:', error);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { conversationId?: number; isGeneral?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    if (data.isGeneral) {
      client.broadcast.emit('typing:general', { userId, isTyping: true });
    } else if (data.conversationId) {
      const recipientSockets = this.connectedUsers.get(data.conversationId);
      if (recipientSockets && recipientSockets.size > 0) {
        recipientSockets.forEach(socketId => {
          this.server.to(socketId).emit('typing:direct', {
            userId,
            isTyping: true,
          });
        });
      }
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { conversationId?: number; isGeneral?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return { error: 'Unauthorized' };
    }

    if (data.isGeneral) {
      client.broadcast.emit('typing:general', { userId, isTyping: false });
    } else if (data.conversationId) {
      const recipientSockets = this.connectedUsers.get(data.conversationId);
      if (recipientSockets && recipientSockets.size > 0) {
        recipientSockets.forEach(socketId => {
          this.server.to(socketId).emit('typing:direct', {
            userId,
            isTyping: false,
          });
        });
      }
    }
  }

  // ✅ Méthode utilitaire pour obtenir les utilisateurs connectés
  @SubscribeMessage('users:online')
  getOnlineUsers() {
    return {
      count: this.connectedUsers.size,
      userIds: Array.from(this.connectedUsers.keys()),
    };
  }
}
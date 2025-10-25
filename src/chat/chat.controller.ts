import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import { SendGeneralMessageDto } from './dto/send-general-message.dto';
import { SendDirectMessageDto } from './dto/send-direct-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { DirectMessage } from '../entities/direct-message.entity';
import { GeneralMessage } from '../entities/general-message.entity';

@ApiTags('Chat')
@Controller('api/chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('general')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Envoyer un message dans le chat général' })
  @ApiResponse({
    status: 201,
    description: 'Message envoyé',
    type: MessageResponseDto,
  })
  async sendGeneralMessage(
    @Req() req,
    @Body() dto: SendGeneralMessageDto,
  ): Promise<GeneralMessage | null> {
    return this.chatService.sendGeneralMessage(req.user.id, dto.content);
  }

  @Get('general')
  @ApiOperation({ summary: 'Récupérer les messages du chat général' })
  @ApiResponse({
    status: 200,
    description: 'Liste des messages',
    type: [MessageResponseDto],
  })
  async getGeneralMessages(): Promise<MessageResponseDto[]> {
    return this.chatService.getGeneralMessages();
  }

  @UseGuards(JwtAuthGuard)
  @Post('direct')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Envoyer un message direct' })
  @ApiResponse({
    status: 201,
    description: 'Message envoyé',
    type: MessageResponseDto,
  })
  async sendDirectMessage(
    @Req() req,
    @Body() dto: SendDirectMessageDto,
  ): Promise<DirectMessage | null> {
    return this.chatService.sendDirectMessage(
      req.user.id,
      dto.recipientId,
      dto.content,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:otherUserId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer une conversation avec un utilisateur' })
  @ApiParam({ name: 'otherUserId', description: "ID de l'autre utilisateur" })
  @ApiResponse({
    status: 200,
    description: 'Messages de la conversation',
    type: [MessageResponseDto],
  })
  async getConversation(
    @Req() req,
    @Param('otherUserId') otherUserId: number,
  ): Promise<MessageResponseDto[]> {
    return this.chatService.getConversation(req.user.id, otherUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: "Récupérer toutes les conversations de l'utilisateur",
  })
  @ApiResponse({ status: 200, description: 'Liste des conversations' })
  async getConversations(@Req() req) {
    return this.chatService.getConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mark-read/:messageId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Marquer un message comme lu' })
  @ApiParam({ name: 'messageId', description: 'ID du message' })
  @ApiResponse({ status: 200, description: 'Message marqué comme lu' })
  async markAsRead(@Param('messageId') messageId: number) {
    return this.chatService.markAsRead(messageId);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  createChatSessionSchema,
  CreateChatSessionDto,
  sendMessageSchema,
  SendMessageDto,
} from '@careeros/shared';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Post('sessions')
  createSession(
    @CurrentUser() user: JwtUser,
    @Body(new ZodValidationPipe(createChatSessionSchema)) dto: CreateChatSessionDto,
  ) {
    return this.chat.createSession(user.userId, dto.title);
  }

  @Get('sessions')
  listSessions(@CurrentUser() user: JwtUser) {
    return this.chat.listSessions(user.userId);
  }

  @Get('sessions/:id')
  getSession(@CurrentUser() user: JwtUser, @Param('id') id: string) {
    return this.chat.getSession(user.userId, id);
  }

  @Post('sessions/:id/messages')
  sendMessage(
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(sendMessageSchema)) dto: SendMessageDto,
  ) {
    return this.chat.sendMessage(user.userId, id, dto.content, {
      provider: dto.provider,
      model: dto.model,
    });
  }
}

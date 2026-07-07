import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiRegistryService } from './ai-registry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly registry: AiRegistryService) {}

  @Get('models')
  @ApiOperation({ summary: 'List AI providers/models for the model switcher' })
  models() {
    return this.registry.catalog();
  }
}

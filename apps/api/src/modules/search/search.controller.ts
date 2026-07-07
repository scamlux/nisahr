import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchRegistryService } from './search-registry.service';
import { SearchToolsService } from './search-tools.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(
    private readonly registry: SearchRegistryService,
    private readonly tools: SearchToolsService,
  ) {}

  @Get('providers')
  @ApiOperation({ summary: 'Active web-search provider + availability' })
  providers() {
    return this.registry.catalog();
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Search jobs (AI-HR tool, also callable directly)' })
  @ApiQuery({ name: 'role', required: true })
  @ApiQuery({ name: 'location', required: false })
  async jobs(@Query('role') role = '', @Query('location') location?: string) {
    return this.tools.searchJobs(role, location);
  }

  @Get('resources')
  @ApiOperation({ summary: 'Search learning resources (AI-HR tool)' })
  @ApiQuery({ name: 'topic', required: true })
  async resources(@Query('topic') topic = '') {
    return this.tools.searchResources(topic);
  }
}

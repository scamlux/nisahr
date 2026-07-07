import { Module } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { RoadmapGraphService } from './roadmap-graph.service';
import { RoadmapController } from './roadmap.controller';

@Module({
  providers: [RoadmapService, RoadmapGraphService],
  controllers: [RoadmapController],
  exports: [RoadmapService, RoadmapGraphService],
})
export class RoadmapModule {}

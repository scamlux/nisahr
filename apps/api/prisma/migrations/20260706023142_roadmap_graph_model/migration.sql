-- CreateEnum
CREATE TYPE "NodeType" AS ENUM ('TOPIC', 'SUBTOPIC', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "NodeStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "EdgeKind" AS ENUM ('REQUIRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "NodeResourceKind" AS ENUM ('FREE_VIDEO', 'OFFICIAL_DOC', 'POPULAR', 'PAID_COURSE', 'ARTICLE', 'PRACTICE');

-- AlterEnum
ALTER TYPE "ProgressEventType" ADD VALUE 'NODE_DONE';

-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "useGraph" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "RoadmapNode" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "group" TEXT NOT NULL DEFAULT '',
    "type" "NodeType" NOT NULL DEFAULT 'TOPIC',
    "status" "NodeStatus" NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT "RoadmapNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeEdge" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "kind" "EdgeKind" NOT NULL DEFAULT 'REQUIRED',

    CONSTRAINT "NodeEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeResource" (
    "id" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "kind" "NodeResourceKind" NOT NULL DEFAULT 'ARTICLE',
    "provider" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 10,
    "lang" TEXT NOT NULL DEFAULT 'en',

    CONSTRAINT "NodeResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoadmapNode_roadmapId_order_idx" ON "RoadmapNode"("roadmapId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "NodeEdge_fromId_toId_key" ON "NodeEdge"("fromId", "toId");

-- CreateIndex
CREATE INDEX "ProgressEvent_userId_createdAt_idx" ON "ProgressEvent"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "RoadmapNode" ADD CONSTRAINT "RoadmapNode_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeEdge" ADD CONSTRAINT "NodeEdge_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeEdge" ADD CONSTRAINT "NodeEdge_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeEdge" ADD CONSTRAINT "NodeEdge_toId_fkey" FOREIGN KEY ("toId") REFERENCES "RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeResource" ADD CONSTRAINT "NodeResource_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "RoadmapNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

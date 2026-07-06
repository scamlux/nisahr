-- CreateTable
CREATE TABLE "JobSearchCache" (
    "id" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobSearchCache_expiresAt_idx" ON "JobSearchCache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobSearchCache_tool_provider_query_key" ON "JobSearchCache"("tool", "provider", "query");

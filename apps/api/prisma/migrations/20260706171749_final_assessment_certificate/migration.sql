-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('IN_PROGRESS', 'PASSED', 'FAILED', 'EXPIRED');

-- CreateTable
CREATE TABLE "FinalAssessmentAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "questionOrder" JSONB NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '[]',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "passThreshold" INTEGER NOT NULL DEFAULT 70,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "timeLimitSec" INTEGER NOT NULL DEFAULT 900,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "FinalAssessmentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapCertificate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "serial" TEXT NOT NULL,
    "verifyToken" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoadmapCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinalAssessmentAttempt_userId_roadmapId_idx" ON "FinalAssessmentAttempt"("userId", "roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapCertificate_roadmapId_key" ON "RoadmapCertificate"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapCertificate_attemptId_key" ON "RoadmapCertificate"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapCertificate_serial_key" ON "RoadmapCertificate"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapCertificate_verifyToken_key" ON "RoadmapCertificate"("verifyToken");

-- CreateIndex
CREATE INDEX "RoadmapCertificate_userId_idx" ON "RoadmapCertificate"("userId");

-- AddForeignKey
ALTER TABLE "FinalAssessmentAttempt" ADD CONSTRAINT "FinalAssessmentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalAssessmentAttempt" ADD CONSTRAINT "FinalAssessmentAttempt_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapCertificate" ADD CONSTRAINT "RoadmapCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapCertificate" ADD CONSTRAINT "RoadmapCertificate_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapCertificate" ADD CONSTRAINT "RoadmapCertificate_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "FinalAssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

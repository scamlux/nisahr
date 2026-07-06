-- CreateTable
CREATE TABLE "PsychTestResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "axes" JSONB NOT NULL,
    "profileCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PsychTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PsychTestResult_userId_createdAt_idx" ON "PsychTestResult"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "PsychTestResult" ADD CONSTRAINT "PsychTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

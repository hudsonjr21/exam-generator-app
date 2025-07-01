-- CreateTable
CREATE TABLE "ExamHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "details" JSONB NOT NULL,
    "exams" JSONB NOT NULL
);

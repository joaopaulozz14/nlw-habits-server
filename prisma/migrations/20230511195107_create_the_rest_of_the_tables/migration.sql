-- CreateTable
CREATE TABLE "habit_week_days" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habit_id" TEXT NOT NULL,
    "weekDay" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "day_habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day_id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "habit_week_days_habit_id_key" ON "habit_week_days"("habit_id");

-- CreateIndex
CREATE UNIQUE INDEX "day_date_key" ON "day"("date");

-- CreateIndex
CREATE UNIQUE INDEX "day_habit_day_id_habit_id_key" ON "day_habit"("day_id", "habit_id");

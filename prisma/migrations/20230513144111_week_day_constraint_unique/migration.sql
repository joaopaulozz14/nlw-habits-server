/*
  Warnings:

  - You are about to drop the column `weekDay` on the `habit_week_days` table. All the data in the column will be lost.
  - Added the required column `week_day` to the `habit_week_days` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_habit_week_days" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "week_day" INTEGER NOT NULL,
    "habit_id" TEXT NOT NULL,
    CONSTRAINT "habit_week_days_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_habit_week_days" ("habit_id", "id") SELECT "habit_id", "id" FROM "habit_week_days";
DROP TABLE "habit_week_days";
ALTER TABLE "new_habit_week_days" RENAME TO "habit_week_days";
CREATE INDEX "habit_week_days_habit_id_idx" ON "habit_week_days"("habit_id");
CREATE UNIQUE INDEX "habit_week_days_habit_id_week_day_key" ON "habit_week_days"("habit_id", "week_day");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

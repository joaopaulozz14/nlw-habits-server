-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_habit" ("created_at", "id", "title") SELECT "created_at", "id", "title" FROM "habit";
DROP TABLE "habit";
ALTER TABLE "new_habit" RENAME TO "habit";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

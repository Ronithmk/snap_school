-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "albumId" TEXT,
    "albumTitle" TEXT NOT NULL DEFAULT '',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending_payment',
    "items" TEXT NOT NULL DEFAULT '[]',
    "totals" TEXT NOT NULL DEFAULT '{}',
    "shippingMethodId" TEXT,
    "shippingAddress" TEXT,
    "countryCode" TEXT NOT NULL DEFAULT 'IN',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "placedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Order_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("albumId", "albumTitle", "countryCode", "customerEmail", "customerName", "id", "items", "orderNumber", "placedAt", "schoolId", "shippingAddress", "shippingMethodId", "status", "totals", "updatedAt") SELECT "albumId", "albumTitle", "countryCode", "customerEmail", "customerName", "id", "items", "orderNumber", "placedAt", "schoolId", "shippingAddress", "shippingMethodId", "status", "totals", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE TABLE "new_PriceList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'IN',
    "currencyCode" TEXT NOT NULL DEFAULT 'INR',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PriceList_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PriceList" ("countryCode", "currencyCode", "id", "isDefault", "name", "schoolId", "updatedAt") SELECT "countryCode", "currencyCode", "id", "isDefault", "name", "schoolId", "updatedAt" FROM "PriceList";
DROP TABLE "PriceList";
ALTER TABLE "new_PriceList" RENAME TO "PriceList";
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schoolId" TEXT NOT NULL,
    "classId" TEXT,
    "number" TEXT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "coverPhotoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Student_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "SchoolClass" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("accessCode", "classId", "coverPhotoUrl", "createdAt", "id", "name", "number", "schoolId", "username") SELECT "accessCode", "classId", "coverPhotoUrl", "createdAt", "id", "name", "number", "schoolId", "username" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_username_key" ON "Student"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

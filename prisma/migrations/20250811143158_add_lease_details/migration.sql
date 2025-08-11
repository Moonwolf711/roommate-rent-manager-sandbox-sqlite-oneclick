-- AlterTable
ALTER TABLE "Household" ADD COLUMN "address" TEXT;

-- AlterTable
ALTER TABLE "Lease" ADD COLUMN "baseRent" INTEGER;
ALTER TABLE "Lease" ADD COLUMN "landlords" TEXT;
ALTER TABLE "Lease" ADD COLUMN "maxOccupants" INTEGER;
ALTER TABLE "Lease" ADD COLUMN "petRent" INTEGER;
ALTER TABLE "Lease" ADD COLUMN "propertyManager" TEXT;
ALTER TABLE "Lease" ADD COLUMN "securityDeposit" INTEGER;

-- CreateTable
CREATE TABLE "Pet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "breed" TEXT,
    "weight" TEXT,
    "isNeuteredSpayed" BOOLEAN NOT NULL DEFAULT false,
    "monthlyFee" INTEGER,
    "deposit" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Pet_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Utility" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leaseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "responsibility" TEXT NOT NULL,
    "provider" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Utility_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

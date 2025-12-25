-- CreateTable
CREATE TABLE "past_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalBookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT,
    "packageName" TEXT,
    "pickupDate" DATETIME NOT NULL,
    "returnDate" DATETIME NOT NULL,
    "totalPrice" REAL NOT NULL,
    "deposit" REAL NOT NULL,
    "originalStatus" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actionBy" TEXT,
    "actionReason" TEXT,
    "deliveryOption" TEXT NOT NULL,
    "signature" TEXT,
    "idUploadUrl" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeDepositIntentId" TEXT,
    "inspectionCompleted" BOOLEAN NOT NULL DEFAULT false,
    "depositRefunded" BOOLEAN NOT NULL DEFAULT false,
    "lateFee" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "past_booking_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pastBookingId" TEXT NOT NULL,
    "equipmentId" TEXT,
    "equipmentName" TEXT,
    "addOnId" TEXT,
    "addOnName" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "past_booking_items_pastBookingId_fkey" FOREIGN KEY ("pastBookingId") REFERENCES "past_bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "past_bookings_userId_idx" ON "past_bookings"("userId");

-- CreateIndex
CREATE INDEX "past_bookings_action_idx" ON "past_bookings"("action");

-- CreateIndex
CREATE INDEX "past_bookings_archivedAt_idx" ON "past_bookings"("archivedAt");

-- CreateIndex
CREATE INDEX "past_booking_items_pastBookingId_idx" ON "past_booking_items"("pastBookingId");

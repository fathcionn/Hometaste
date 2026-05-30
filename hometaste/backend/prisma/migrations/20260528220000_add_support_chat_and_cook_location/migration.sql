-- Add cook location fields for browse-by-area.
ALTER TABLE "Cook" ADD COLUMN "locationLat" DOUBLE PRECISION;
ALTER TABLE "Cook" ADD COLUMN "locationLng" DOUBLE PRECISION;
ALTER TABLE "Cook" ADD COLUMN "locationCity" TEXT;
ALTER TABLE "Cook" ADD COLUMN "locationArea" TEXT;

-- Add live customer support chat.
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'WAITING_FOR_AGENT', 'AGENT_JOINED', 'RESOLVED', 'CLOSED');

CREATE TABLE "SupportTicket" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupportMessage" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SupportTicket_userId_idx" ON "SupportTicket"("userId");
CREATE INDEX "SupportTicket_status_idx" ON "SupportTicket"("status");
CREATE INDEX "SupportMessage_ticketId_idx" ON "SupportMessage"("ticketId");

ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add customer refund requests.
CREATE TYPE "RefundReason" AS ENUM ('NOT_DELIVERED', 'WRONG_ITEMS', 'FOOD_QUALITY', 'COOK_CANCELLED', 'OTHER');
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED');

CREATE TABLE "RefundRequest" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "reason" "RefundReason" NOT NULL,
  "description" TEXT,
  "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RefundRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RefundRequest_orderId_idx" ON "RefundRequest"("orderId");
CREATE INDEX "RefundRequest_customerId_idx" ON "RefundRequest"("customerId");
CREATE INDEX "RefundRequest_status_idx" ON "RefundRequest"("status");

ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefundRequest" ADD CONSTRAINT "RefundRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

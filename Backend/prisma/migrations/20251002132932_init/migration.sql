-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillParticipant" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "billId" INTEGER NOT NULL,
    "amountOwed" DOUBLE PRECISION NOT NULL,
    "isSettled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BillParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_senderId_receiverId_key" ON "Friend"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "BillParticipant_userId_billId_key" ON "BillParticipant"("userId", "billId");

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillParticipant" ADD CONSTRAINT "BillParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillParticipant" ADD CONSTRAINT "BillParticipant_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

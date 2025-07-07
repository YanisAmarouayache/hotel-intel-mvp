/*
  Warnings:

  - You are about to drop the column `price` on the `hotels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `hotels` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "hotels" DROP COLUMN "price",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "amenities" TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "isCompetitor" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reviewCount" INTEGER,
ADD COLUMN     "starRating" DOUBLE PRECISION,
ADD COLUMN     "url" TEXT NOT NULL DEFAULT 'https://booking.com/placeholder',
ADD COLUMN     "userRating" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "room_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hotelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "room_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_prices" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "hotelId" INTEGER NOT NULL,
    "roomCategoryId" INTEGER,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" SERIAL NOT NULL,
    "hotelId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "avgPrice" DOUBLE PRECISION NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_prices_hotelId_roomCategoryId_date_key" ON "daily_prices"("hotelId", "roomCategoryId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "price_history_hotelId_date_key" ON "price_history"("hotelId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "hotels_url_key" ON "hotels"("url");

-- AddForeignKey
ALTER TABLE "room_categories" ADD CONSTRAINT "room_categories_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_prices" ADD CONSTRAINT "daily_prices_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_prices" ADD CONSTRAINT "daily_prices_roomCategoryId_fkey" FOREIGN KEY ("roomCategoryId") REFERENCES "room_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

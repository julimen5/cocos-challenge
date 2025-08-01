-- CreateEnum
CREATE TYPE "InstrumentType" AS ENUM ('ACCIONES', 'MONEDA');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MARKET', 'LIMIT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'FILLED', 'REJECTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "accountnumber" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instruments" (
    "id" SERIAL NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InstrumentType" NOT NULL DEFAULT 'ACCIONES',

    CONSTRAINT "instruments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "instrumentid" INTEGER NOT NULL,
    "userid" INTEGER NOT NULL,
    "side" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "price" DECIMAL(10,2),
    "type" "OrderType" NOT NULL DEFAULT 'MARKET',
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "datetime" TIMESTAMP(3),
    "reason" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketdata" (
    "id" SERIAL NOT NULL,
    "instrumentid" INTEGER NOT NULL,
    "high" DECIMAL(10,2),
    "low" DECIMAL(10,2),
    "open" DECIMAL(10,2),
    "close" DECIMAL(10,2),
    "previousclose" DECIMAL(10,2),
    "date" DATE,

    CONSTRAINT "marketdata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "instruments_ticker_key" ON "instruments"("ticker");

-- CreateIndex
CREATE INDEX "instruments_ticker_idx" ON "instruments"("ticker");

-- CreateIndex
CREATE INDEX "instruments_name_idx" ON "instruments"("name");

-- CreateIndex
CREATE INDEX "instruments_ticker_name_idx" ON "instruments"("ticker", "name");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_instrumentid_fkey" FOREIGN KEY ("instrumentid") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketdata" ADD CONSTRAINT "marketdata_instrumentid_fkey" FOREIGN KEY ("instrumentid") REFERENCES "instruments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

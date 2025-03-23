/*
  Warnings:

  - A unique constraint covering the columns `[id_parcela]` on the table `parcelas` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_parcela` to the `parcelas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parcelas" ADD COLUMN     "id_parcela" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "sensores_parcela" ALTER COLUMN "registrado_en" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "cambios_parcela" (
    "id" SERIAL NOT NULL,
    "parcela_id" INTEGER NOT NULL,
    "cambio_tipo" TEXT NOT NULL,
    "campo" TEXT NOT NULL,
    "valor_anterior" TEXT,
    "valor_nuevo" TEXT,
    "registrado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cambios_parcela_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parcelas_id_parcela_key" ON "parcelas"("id_parcela");

-- AddForeignKey
ALTER TABLE "cambios_parcela" ADD CONSTRAINT "cambios_parcela_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id_parcela") ON DELETE RESTRICT ON UPDATE CASCADE;

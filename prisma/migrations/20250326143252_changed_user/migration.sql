/*
  Warnings:

  - You are about to drop the column `correo_usuario` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `nombre_usuario` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the column `pass_usaurio` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `correo` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "correo_usuario",
DROP COLUMN "nombre_usuario",
DROP COLUMN "pass_usaurio",
ADD COLUMN     "correo" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

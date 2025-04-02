-- DropForeignKey
ALTER TABLE "sensores_parcela" DROP CONSTRAINT "sensores_parcela_parcela_id_fkey";

-- AddForeignKey
ALTER TABLE "sensores_parcela" ADD CONSTRAINT "sensores_parcela_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id_parcela") ON DELETE RESTRICT ON UPDATE CASCADE;

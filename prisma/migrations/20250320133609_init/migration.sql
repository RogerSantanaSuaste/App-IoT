-- CreateTable
CREATE TABLE "parcelas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "tipo_cultivo" TEXT NOT NULL,
    "ultimo_riego" TIMESTAMP(3) NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "parcelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensores_parcela" (
    "id" SERIAL NOT NULL,
    "parcela_id" INTEGER NOT NULL,
    "humedad" DOUBLE PRECISION NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "lluvia" DOUBLE PRECISION NOT NULL,
    "sol" DOUBLE PRECISION NOT NULL,
    "registrado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensores_parcela_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sensores_parcela" ADD CONSTRAINT "sensores_parcela_parcela_id_fkey" FOREIGN KEY ("parcela_id") REFERENCES "parcelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

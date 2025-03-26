-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "correo_usuario" TEXT NOT NULL,
    "pass_usaurio" TEXT NOT NULL,
    "nombre_usuario" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

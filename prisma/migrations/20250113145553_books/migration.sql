-- CreateTable
CREATE TABLE "Books" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "judul" TEXT NOT NULL,
    "penulis" TEXT NOT NULL,
    "penerbit" TEXT NOT NULL,
    "tahun_terbit" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Books_judul_key" ON "Books"("judul");

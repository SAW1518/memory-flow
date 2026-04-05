-- CreateTable
CREATE TABLE "general_words" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_words" (
    "user_id" VARCHAR(255) NOT NULL,
    "content" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_words_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "general_words_content_key" ON "general_words"("content");

/*
  Warnings:

  - The primary key for the `users_words` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "users_words" DROP CONSTRAINT "users_words_pkey",
ADD CONSTRAINT "users_words_pkey" PRIMARY KEY ("user_id", "content");

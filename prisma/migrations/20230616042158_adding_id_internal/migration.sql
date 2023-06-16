/*
  Warnings:

  - A unique constraint covering the columns `[id_internal]` on the table `Guest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_internal` to the `Guest` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Guest] ADD [id_internal] VARCHAR(200) NOT NULL;

-- CreateIndex
ALTER TABLE [dbo].[Guest] ADD CONSTRAINT [Guest_id_internal_key] UNIQUE NONCLUSTERED ([id_internal]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

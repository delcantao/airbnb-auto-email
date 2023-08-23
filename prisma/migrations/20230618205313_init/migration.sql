BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Guest] (
    [id] INT NOT NULL IDENTITY(1,1),
    [id_internal] VARCHAR(200) NOT NULL,
    [chat_text] VARCHAR(8000),
    [date_text] VARCHAR(8000),
    [name] VARCHAR(200),
    [document] VARCHAR(200),
    [name_partner] VARCHAR(200),
    [document_partner] VARCHAR(200),
    [checkin_date] DATETIME,
    [checkout_date] DATETIME,
    [email_flat_sent] BIT NOT NULL CONSTRAINT [Guest_email_flat_sent_df] DEFAULT 0,
    [guest_canceled] BIT NOT NULL CONSTRAINT [Guest_guest_canceled_df] DEFAULT 0,
    [flat_id] INT NOT NULL CONSTRAINT [Guest_flat_id_df] DEFAULT 1201,
    [price] DECIMAL(18,2) NOT NULL CONSTRAINT [Guest_price_df] DEFAULT 0,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [Guest_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [guestUseCar] BIT CONSTRAINT [Guest_guestUseCar_df] DEFAULT 0,
    [carLicense] VARCHAR(200),
    CONSTRAINT [Guest_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Guest_id_internal_key] UNIQUE NONCLUSTERED ([id_internal])
);

-- CreateTable
CREATE TABLE [dbo].[OpenAIUsage] (
    [id] INT NOT NULL IDENTITY(1,1),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [OpenAIUsage_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [completionTokens] BIGINT NOT NULL,
    [promptTokens] BIGINT NOT NULL,
    [totalTokens] BIGINT NOT NULL,
    CONSTRAINT [OpenAIUsage_pkey] PRIMARY KEY CLUSTERED ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

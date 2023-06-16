import { Guest, OpenAIUsage, PrismaClient } from "@prisma/client";
import {
  extractCheckinCheckout,
  extractNameAndDocumentGuests,
} from "../openAI";
import {
  getCpfAndNameFromChatText,
  getNameByCpf,
} from "../provider/cpf-finder";

const prisma = new PrismaClient();

async function createGuest(chat: Guest) {
  try {
    const found = await prisma.guest.findMany({
      where: { id_internal: chat.id_internal },
    });

    if (found.length == 0)
      await prisma.guest.create({
        data: chat,
      });
    // prisma.guest.update;
    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
async function getGuestsToUpdate(): Promise<Guest[]> {
  try {
    const chats = await prisma.guest.findMany({
      where: {
        OR: [
          { document: null },
          { document: "" },
          { checkout_date: null },
          { checkin_date: null },
        ],
        AND: [{ chat_text: { not: "" } }, { guest_canceled: false }],
      },
    });
    await prisma.$disconnect();
    return chats;
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
async function getGuests(): Promise<Guest[]> {
  try {
    const chats = await prisma.guest.findMany();
    await prisma.$disconnect();
    return chats;
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
async function updateGuestStatusEmail(
  id: number,
  success: boolean
): Promise<boolean> {
  try {
    const data = {
      email_flat_sent: success,
    };
    console.log(`updating guest ${id}`, data);
    const updated = await prisma.guest.update({
      where: { id: id },
      data,
    });
    return updated?.email_flat_sent ?? false;
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    // process.exit(1);
  }
  return false;
}
async function updateGuest(id: number, guest: Guest): Promise<Guest | null> {
  try {
    const data = {
      checkin_date: guest.checkin_date,
      checkout_date: guest.checkout_date,
      name: (await getNameByCpf(guest.document)) ?? guest.name,
      document: guest.document,
      name_partner:
        (await getNameByCpf(guest.document_partner)) ?? guest.name_partner,
      document_partner: guest.document_partner,
    };
    console.log(`updating guest ${id}`, data);
    return await prisma.guest.update({
      where: { id: id },
      data,
    });

    //     model Guest {
    //   id               Int       @id @default(autoincrement())
    //   chat_text        String    @db.VarChar(8000)
    //   date_text        String    @db.VarChar(8000)
    //   name             String?   @db.VarChar(200)
    //   document         String?   @db.VarChar(200)
    //   name_partner     String?   @db.VarChar(200)
    //   document_partner String?   @db.VarChar(200)
    //   checkin_date     DateTime? @db.DateTime
    //   checkout_date    DateTime? @db.DateTime
    //   email_flat_sent  Boolean   @default(false)
    //   guest_canceled   Boolean   @default(false)
    //   flat_id          Int       @default(1201)
    //   price            Decimal   @default(0) @db.Decimal(18, 2)
    //   updatedAt        DateTime  @default(now())
    // }
  } catch (prisma) {
    console.log("error when trying to update Guest to prisma:", prisma);
    return null;
  }
}

const updateEntriesWithDateNamesAndDocuments = async () => {
  const guests = (await getGuestsToUpdate()) as Guest[];
  console.log(`guests to update: ${guests.length}`);

  guests.forEach(async (guest: Guest) => {
    const dates = await extractCheckinCheckout(guest.date_text);
    const guestData = await getCpfAndNameFromChatText(guest.chat_text);

    console.log(`dates`, dates);
    console.log(`guestData`, guestData);

    try {
      guest.checkin_date = new Date(dates?.checkin ?? "1900-01-01");
      guest.checkout_date = new Date(dates?.checkout ?? "1900-01-01");

      guest.price = dates.price;

      guest.name = guestData[0]?.name ?? guest.name;
      guest.document = guestData[0]?.document ?? guest.document;

      guest.name_partner = guestData[1]?.name ?? guest.name_partner;
      guest.document_partner = guestData[1]?.document ?? guest.document_partner;
    } catch (error) {
      console.log("setting data", error);
    }
    await updateGuest(guest.id, guest);
  });
};

async function createOpenAIUsage(
  completionTokens: number,
  promptTokens: number,
  totalTokens: number
) {
  try {
    const usage: any = {
      completionTokens,
      promptTokens,
      totalTokens,
    };
    await prisma.openAIUsage.create({
      data: usage,
    });
    await prisma.$disconnect();
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
export {
  createGuest,
  getGuests,
  updateGuest,
  createOpenAIUsage,
  getGuestsToUpdate,
  updateEntriesWithDateNamesAndDocuments,
  updateGuestStatusEmail,
};

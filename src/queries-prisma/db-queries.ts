import { Guest, OpenAIUsage, PrismaClient } from "@prisma/client";
import {
  extractCheckinCheckout,
  extractNameAndDocumentGuests,
  extractVehicle,
} from "../openAI";
import {
  getCpfAndNameFromChatText,
  getNameByCpf,
} from "../provider/cpf-finder";

const prisma = new PrismaClient();

async function createOrUpdateGuest(chat: Guest) {
  try {
    const found = await prisma.guest.findMany({
      where: { id_internal: chat.id_internal },
    });

    if (found.length == 0)
      await prisma.guest.create({
        data: chat,
      });
    else
      await prisma.guest.update({
        where: { id_internal: chat.id_internal },
        data: {
          chat_text: chat.chat_text,
          date_text: chat.date_text,
        },
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
    const startDate = new Date("1900-01-01");
    const chats = await prisma.guest.findMany({
      where: {
        OR: [
          { document: null },
          //   // { document: "" },
          //   // { checkout_date: null },
          { checkin_date: { equals: null } },
          { checkin_date: { equals: undefined } },
          { checkin_date: { equals: startDate } },
          { checkout_date: { equals: null } },
          { checkout_date: { equals: undefined } },
          { checkout_date: { equals: startDate } },
        ],
        AND: [
          { chat_text: { not: "" } },
          { chat_text: { not: null } },
          // { checkout_date: null },
          { guest_canceled: false },

          { document: undefined },
          { checkout_date: undefined },
          { checkin_date: undefined },
          { name: { not: "Atendimento ao Cliente do Airbnb" } },
        ],
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
  id: string,
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
async function updateGuest(id: string, guest: Guest): Promise<Guest | null> {
  try {
    const data = {
      checkin_date: guest.checkin_date,
      checkout_date: guest.checkout_date,
      name: (await getNameByCpf(guest.document)) ?? guest.name,
      document: guest.document,
      name_partner:
        (await getNameByCpf(guest.document_partner)) ?? guest.name_partner,
      document_partner: guest.document_partner,
      carLicense: guest.carLicense,
      guestUseCar: guest.guestUseCar,
    };

    console.log(`updating guest ${id}`, data);
    return await prisma.guest.update({
      where: { id: id },
      data,
    });
  } catch (prisma) {
    console.log("error when trying to update Guest to prisma:", prisma);
    return null;
  }
}

const updateEntriesWithDateNamesVehiclesAndDocuments = async () => {
  const guests = (await getGuestsToUpdate()) as Guest[];
  console.log(`guests to update: ${guests.length}`);

  guests.forEach(async (guest: Guest) => {
    const dates = await extractCheckinCheckout(guest.date_text);
    const guestData = await getCpfAndNameFromChatText(guest.chat_text);
    const vehicle = await extractVehicle(guest.chat_text);

    // console.log(`dates`, dates);
    // console.log(`guestData`, guestData);
    console.log(`vehicle`, vehicle);

    try {
      guest.checkin_date = new Date(dates?.checkin ?? "1900-01-01");
      guest.checkout_date = new Date(dates?.checkout ?? "1900-01-01");

      guest.price = dates.price;

      guest.carLicense = vehicle?.plate ?? guest.carLicense;
      guest.guestUseCar = vehicle?.car ?? guest.guestUseCar;

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
  createOrUpdateGuest,
  getGuests,
  updateGuest,
  createOpenAIUsage,
  getGuestsToUpdate,
  updateEntriesWithDateNamesVehiclesAndDocuments,
  updateGuestStatusEmail,
};

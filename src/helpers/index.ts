import { sendEmail } from "../provider/email-sender";
import {
  getGuests,
  updateGuestStatusEmail,
} from "../queries-prisma/db-queries";

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
const capitalizeFirstLetters = (text: string) => {
  const palavras = text.toLowerCase().split(" ");

  for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];
    palavras[i] = palavra.charAt(0).toUpperCase() + palavra.slice(1);
  }

  return palavras.join(" ");
};

const loopSendEmail = async () => {
  const guests = await getGuests();
  const today = new Date();

  const guestToEmail = guests.filter(
    (e) =>
      e.document != null &&
      e.document.length > 0 &&
      e.email_flat_sent == false &&
      e.name != "" &&
      e.checkin_date != null &&
      e.checkin_date?.toDateString() === today.toDateString()
  );
  console.log("guestToEmail", guestToEmail);
  for (let i = 0; i < guestToEmail.length; i++) {
    const guest = guests[i];
    console.log("guest", guest);
    if (guest.email_flat_sent) {
      console.log("guest.email_flat_sent", guest.email_flat_sent);
      continue;
    }
    const success = await sendEmail(guest);
    await updateGuestStatusEmail(guest.id, success);
    await sleep(1000);
  }
};
export { sleep, loopSendEmail, capitalizeFirstLetters };

import { Guest } from "@prisma/client";
import { getHtmlEmail, replaceEmailData } from "./provider/email-sender";
import { getGuests, updateEntriesWithDateNamesVehiclesAndDocuments } from "./queries-prisma/db-queries";
import fs from "fs";
import { extractCheckinCheckout, extractVehicle } from "./openAI";

(async () => {
  const guests = await getGuests();
  const guestToLoop = guests.filter(
    (e) => e.id_internal == `Cristiane Vasconcelos22 – 26 de jun.`
  );
  await updateEntriesWithDateNamesVehiclesAndDocuments();
  // guestToLoop.forEach(async (guest) => {
    
  //   // const html = await getHtmlEmail();
  //   // const body = replaceEmailData(html, guest);
  //   // await fs.writeFileSync(`${guest.name}.html`, body as string);
  // });
})();

import { Guest } from "@prisma/client";
import { getHtmlEmail, replaceEmailData } from "./provider/email-sender";
import {
  getGuests,
  getGuestsToUpdate,
  updateEntriesWithDateNamesVehiclesAndDocuments,
} from "./queries-prisma/db-queries";
import fs from "fs";
import { extractCheckinCheckout, extractVehicle } from "./openAI";
import { loopSendEmail } from "./helpers";

(async () => {
  // await updateEntriesWithDateNamesVehiclesAndDocuments();
  const g = await getGuestsToUpdate();
  console.log(g);
  // await loopSendEmail();
  // guestToLoop.forEach(async (guest) => {

  //   // const html = await getHtmlEmail();
  //   // const body = replaceEmailData(html, guest);
  //   // await fs.writeFileSync(`${guest.name}.html`, body as string);
  // });
})();

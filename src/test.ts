const pkg = require("../package.json");

import { Guest } from "@prisma/client";
import { getHtmlEmail, replaceEmailData } from "./provider/email-sender";
import {
  getGuests,
  getGuestsToUpdate,
  updateEntriesWithDateNamesVehiclesAndDocuments,
  updateRunStatus,
} from "./queries-prisma/db-queries";

import fs from "fs";
import { extractCheckinCheckout, extractVehicle } from "./openAI";
import { loopSendEmail } from "./helpers";

(async () => {
  // await updateEntriesWithDateNamesVehiclesAndDocuments();
  
  await updateEntriesWithDateNamesVehiclesAndDocuments()
  // console.log('result as json', result.length);
  // result.forEach(async (guest) => {
  //   const r = await extractCheckinCheckout(guest.date_text)
  //   console.log(guest.date_text, r);
  // });
  // await loopSendEmail();

  // console.log({ release: pkg.version, machineName: process.env });
  // await loopSendEmail();
  // guestToLoop.forEach(async (guest) => {

  //   // const html = await getHtmlEmail();
  //   // const body = replaceEmailData(html, guest);
  //   // await fs.writeFileSync(`${guest.name}.html`, body as string);
  // });
})();

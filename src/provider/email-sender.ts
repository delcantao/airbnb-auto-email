import { Guest } from "@prisma/client";
import { updateGuestStatusEmail } from "../queries-prisma/db-queries";
const path = require("path");
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
const fs = require("fs");
const guestText = "<p> <b>${guest.name} - ${guest.document} </b></p>";
// read data from a file
dotenv.config({ override: true });
const getRootPath = () => {
  let currentPath = __dirname;
  let parentPath = path.resolve(currentPath, "..");

  while (currentPath !== parentPath) {
    currentPath = parentPath;
    parentPath = path.resolve(currentPath, "..");
  }

  return currentPath;
};

function stringifySafe(obj: any) {
  const cache = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (cache.has(value)) {
        // Circular reference found, replace with a placeholder
        return "[Circular Reference]";
      }
      cache.add(value);
    }
    return value;
  });
}
const getHtmlEmail = async () => {
  const emailPath = path.resolve(require.main?.path, "email", "model.html");
  const data = await fs.readFileSync(emailPath, "utf8");
  return data;
};
const replaceEmailData = (body: String, guest: Guest) => {
  let guestReplace = [];

  guestReplace.push(
    guestText
      .replace("${guest.name}", guest.name ?? "Não informado")
      .replace("${guest.document}", guest.document ?? "Não informado")
  );

  guestReplace.push(
    guestText
      .replace("${guest.name}", guest.name_partner ?? "Não informado")
      .replace("${guest.document}", guest.document_partner ?? "Não informado")
  );
  const checkin = guest.checkin_date
    ?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join(".");
  const checkout = guest.checkout_date
    ?.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .split("/")
    .join(".");
  console.log("guestReplace", guestReplace.join(" "));
  body = body.replace("${guest}", guestReplace.join(" "));
  body = body.replace("${guest.checkin}", checkin ?? "");
  body = body.replace("${guest.checkout}", checkout ?? "");
  body = body.replace(
    "${com acompanhante}",
    guestReplace.length > 1 ? "com acompanhante" : ""
  );
  // {guests}

  return body;
};
const sendEmail = async (guest: Guest) => {
  try {
    let body = await getHtmlEmail();
    body = replaceEmailData(body, guest);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: process.env.SENDGRID_EMAIL_TO, // Change to your recipient
      from: process.env.SENDGRID_EMAIL_FROM, // Change to your verified sender
      subject: "Flat 1201 - Novo Hóspede",
      // text: "and easy to do anywhere, even with Node.js",
      html: body,
    };
    const result = await sgMail.send(msg);
    const status = result[0]?.statusCode === 202;
    const updated = await updateGuestStatusEmail(guest.id, status);

    return updated;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export { sendEmail, getHtmlEmail };

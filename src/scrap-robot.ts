import { Guest } from "@prisma/client";
import { ElementHandle, Page } from "puppeteer";
import { loopSendEmail, sleep } from "./helpers";
import { extractCheckinCheckout, extractNameAndDocumentGuests } from "./openAI";
import {
  getGuests,
  updateGuest,
  getGuestsToUpdate,
  updateEntriesWithDateNamesVehiclesAndDocuments,
  createOrUpdateGuest,
} from "./queries-prisma/db-queries";

const dotenv = require("dotenv");
const fs = require("fs");
const sql = require("mssql");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

dotenv.config({ override: true });

const userAgent =
  process.env.USER_AGENT ??
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
const executablePath = process.env.CHROME_PATH;
const user = process.env.USER_AIRBNB;
const pass = process.env.PASS_AIRBNB;
const timeToWait = 1000 * 60 * 5;

const infiniteReadChats = async (page: Page) => {
  try {
    while (true) {
      await sleep(5000);
      let name = "";
      let dates = "";
      const chats: ElementHandle<HTMLAnchorElement>[] = await page.$$(
        "#inbox-scroll-content a"
      );

      console.log("chats", chats);
      for (let i = 0; i < chats.length; i++) {
        try {
          await chats[i].click();
          await sleep(5000);

          name = await chats[i].evaluate(
            (el: any) =>
              el.children[1]?.children[1]?.children[0]?.children[0]?.textContent
          );
          dates = await chats[i].evaluate((el: any) =>
            el.children[1].children[3].children[0].textContent
              .split("·")[0]
              .trim()
          );

          const chatContent = await page.evaluate(() => {
            const elemento = document.querySelectorAll(
              'div[data-testid="message-list"]'
            )[0];
            return elemento ? elemento.textContent : null;
          });
          const dateContent = await page.evaluate(() => {
            const elemento = document.querySelectorAll(
              'div[data-section-id="HEADER"'
            )[0];
            return elemento ? elemento.textContent : null;
          });
          const guest: any = {
            chat_text: chatContent,
            date_text: dateContent,
            id_internal: name + dates,
            name,
            guestUseCar: null,
            // id: 0,
            // document: null,
            // name_partner: null,
            // document_partner: null,
            // checkin_date: null,
            // checkout_date: null,
            // email_flat_sent: false,
            // guest_canceled: false,
            // flat_id: 0,
            // price: 0.0 as any,
            // guestUseCar: false,
            // carLicense: null,
            // updatedAt: new Date(),
          };

          await createOrUpdateGuest(guest);
          console.log(`chatContent ${i} - OK`, guest.id_internal);
        } catch (error) {
          console.log(`chatContent ${i} - ERROR`, error);
        }
      }

      console.log("esperando 5 minutos para o proximo LOOP");
      await updateEntriesWithDateNamesVehiclesAndDocuments();
      await loopSendEmail();
      await sleep(timeToWait);
      await page.reload();
    }
  } catch (error) {}
};

puppeteer.use(StealthPlugin());
(async () => {
  const browser = await puppeteer.launch({
    // executablePath: executablePath,
    headless: false,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);

  await page.setUserAgent(userAgent);

  await page.goto("https://pt.airbnb.com/login");

  await page.waitForNetworkIdle();

  await page.click('button[aria-label="Continuar com email"]');

  await page.type("input[name='user[email]'", user);

  await page.click('button[data-veloute="submit-btn-cypress"]');

  await sleep(1000);

  await page.type("input[name='user[password]'", pass);

  await page.click("button[data-veloute='submit-btn-cypress'");

  await page.waitForNavigation();

  await page.goto("https://pt.airbnb.com/hosting/inbox/");

  infiniteReadChats(page);
})();

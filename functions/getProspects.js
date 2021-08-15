const sha256 = require("crypto-js/sha256");
const uuid = require("uuid");
const puppeteer = require("puppeteer-extra");
const functions = require("firebase-functions");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const loginPage = require("./pages/login");
const hashtagPage = require("./pages/hashtag");

module.exports = (admin) => async (context) => {
  let browser;
  let page;
  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  try {
    browser = await puppeteer.launch({
      headless: true,
    });

    page = await browser.newPage();
    await page.setDefaultTimeout(10000);
    await loginPage.login(
      page,
      functions.config().instagram.username,
      functions.config().instagram.password
    );
    const users = await hashtagPage.collectUsers(page, "programmingmemes");

    for (const user of users) {
      try {
        const userRef = db.collection("users").doc(sha256(user).toString());
        const doc = await userRef.get();

        // If user does not already exist create it
        // Otherwise, do nothing
        if (!doc.exists) {
          await userRef.set({
            name: user,
            followedAt: null,
            unfollowedAt: null,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
    // Save users to firestore
  } catch (error) {
    // Uncomment if you debugging locally
    if (page) {
      const id = uuid.v4();
      const screenshot = await page.screenshot({
        encoding: "base64",
      });

      const file = bucket.file(`${id}.png`);
      const base64EncodedString = screenshot.replace(
        /^data:\w+\/\w+;base64,/,
        ""
      );
      const fileBuffer = Buffer.from(base64EncodedString, "base64");
      await file.save(fileBuffer, {
        metadata: {
          metadata: {
            firebaseStorageDownloadTokens: id,
          },
        },
      });
    }
    console.log(error);
  } finally {
    browser && browser.close();
    return null;
  }
};

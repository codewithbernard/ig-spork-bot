const uuid = require("uuid");
const puppeteer = require("puppeteer-extra");
const functions = require("firebase-functions");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const loginPage = require("./pages/login");
const userPage = require("./pages/user");

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
    await page.setDefaultTimeout(15000);
    await loginPage.login(
      page,
      functions.config().instagram.username,
      functions.config().instagram.password
    );

    // Get 5 users that has not been followed
    const snapshot = await db
      .collection("users")
      .where("followedAt", "==", null)
      .limit(5)
      .get();
    const users = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    // Follow each user one by one
    for (const user of users) {
      try {
        // Try to follow the user
        await userPage.follow(page, user.name);
        await db
          .collection("users")
          .doc(user.id)
          .update({ followedAt: admin.firestore.FieldValue.serverTimestamp() });
      } catch (error) {
        // Followe was not succesfull. Check if user was removed
        const removed = await userPage.userRemoved(page);
        if (removed) {
          await db.collection("users").doc(user.id).delete();
        }
      }
    }
  } catch (error) {
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

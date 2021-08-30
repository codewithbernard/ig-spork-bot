const uuid = require("uuid");
const puppeteer = require("puppeteer-extra");
const functions = require("firebase-functions");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const loginPage = require("../pages/linkedIn/login");
const userPage = require("../pages/linkedIn/user");

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
      functions.config().linked_in.username,
      functions.config().linked_in.password
    );

    // try {
    //   await page.waitFor(15000);
    //   const codeButton = await page.waitForXPath(
    //     "//input[@type='text' or @type='number']"
    //   );

    //   await page.waitFor(60000);

    //   const code = await db.collection("linkedInCode").doc("code").get();
    //   await codeButton.type(code.data().pin);
    //   const submitButton = await page.waitForXPath("//button[@type='submit']");
    //   await submitButton.click();

    //   await page.waitFor(10000);
    // } catch (error) {
    //   console.log(error);
    // }

    // Get 5 users that has not been followed
    const snapshot = await db
      .collection("linkedInUsers")
      .where("followedAt", "==", null)
      .limit(5)
      .get();
    const users = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    // Follow each user one by one
    for (const user of users) {
      try {
        // Try to follow the user
        await userPage.follow(page, user.link, user.name);
        await db
          .collection("linkedInUsers")
          .doc(user.id)
          .update({ followedAt: admin.firestore.FieldValue.serverTimestamp() });
      } catch (error) {
        console.log(error);
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

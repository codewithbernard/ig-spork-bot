const sha256 = require("crypto-js/sha256");
const puppeteer = require("puppeteer-extra");
const functions = require("firebase-functions");

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const loginPage = require("./pages/linkedIn/login");
const searchPage = require("./pages/linkedIn/search");

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
      functions.config().linked_in.username,
      functions.config().linked_in.password
    );

    const likers = await searchPage.getLikers(
      page,
      "https://www.linkedin.com/search/results/content/?keywords=%23reactjs&origin=GLOBAL_SEARCH_HEADER&page=2&update=urn%3Ali%3Afs_updateV2%3A(urn%3Ali%3Aactivity%3A6837277894318850048%2CBLENDED_SEARCH_FEED%2CEMPTY%2CDEFAULT%2Cfalse)"
    );

    for (const user of likers) {
      try {
        const userRef = db
          .collection("linkedInUsers")
          .doc(sha256(user.name).toString());
        const doc = await userRef.get();

        // If user does not already exist create it
        // Otherwise, do nothing
        if (!doc.exists) {
          await userRef.set({
            name: user.name,
            link: user.link,
            followedAt: null,
            unfollowedAt: null,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    // Uncomment if you debugging locally
    // if (page) {
    //   const id = uuid.v4();
    //   const screenshot = await page.screenshot({
    //     encoding: "base64",
    //   });

    //   const file = bucket.file(`${id}.png`);
    //   const base64EncodedString = screenshot.replace(
    //     /^data:\w+\/\w+;base64,/,
    //     ""
    //   );
    //   const fileBuffer = Buffer.from(base64EncodedString, "base64");
    //   await file.save(fileBuffer, {
    //     metadata: {
    //       metadata: {
    //         firebaseStorageDownloadTokens: id,
    //       },
    //     },
    //   });
    // }
    console.log(error);
  } finally {
    browser && browser.close();
    return null;
  }
};

const admin = require("firebase-admin");

const follow = require("./functions/follow");
const getProspects = require("./functions/getProspects");
const getLinkedInProspects = require("./functions/getLinkedInProspects");
const serviceAccount = require("./account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "ig-spork-bot.appspot.com",
});

getLinkedInProspects(admin)();
// getProspects(admin)();
// follow(admin)();

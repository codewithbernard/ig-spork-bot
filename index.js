const admin = require("firebase-admin");

// const follow = require("./functions/follow");
const getProspects = require("./functions/linkedIn/getProspects");
const follow = require("./functions/linkedIn/follow");
const serviceAccount = require("./account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "ig-spork-bot.appspot.com",
});

getProspects(
  admin,
  "https://www.linkedin.com/posts/javascript-developer_activity-6837656809285660672-ymUi/"
)();
// follow(admin)();

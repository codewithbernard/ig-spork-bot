const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp();

const getProspects = require("./getProspects");

exports.getProspects = functions
  .region("europe-west2")
  .runWith({ memory: "512MB", timeoutSeconds: 300 })
  .pubsub.schedule("every 12 hours")
  .onRun(getProspects(admin));

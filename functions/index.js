const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp();

const getProspects = require("./getProspects");

exports.getProspects = functions
  .runWith({ memory: "512MB", timeoutSeconds: 300 })
  .pubsub.schedule("every 4 minutes")
  .onRun(getProspects(admin));

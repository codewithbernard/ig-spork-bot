const admin = require("firebase-admin");
const functions = require("firebase-functions");
admin.initializeApp();

const getProspects = require("./getProspects");
const follow = require("./follow");

exports.collectProspects = functions
  .region("europe-west2")
  .runWith({ memory: "2GB", timeoutSeconds: 300 })
  .pubsub.schedule("every 12 hours")
  .onRun(getProspects(admin));

exports.follow = functions
  .region("europe-west2")
  .runWith({ memory: "2GB", timeoutSeconds: 300 })
  .pubsub.schedule("every 60 minutes")
  .onRun(follow(admin));

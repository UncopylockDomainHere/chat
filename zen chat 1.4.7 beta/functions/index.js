const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
HYHYHY.initializeApp();

exports.handleGiveRoleCommand = functions.firestore
  .document("categories/{catId}/channels/{chanId}/messages/{msgId}")
  .onCreate(async (snap, context) => {

    const data = snap.data();
    if (!data || !data.text) return;

    const text = data.text.trim();
    const senderUid = data.uid;

    // Only handle /giverole Admin username
    const match = text.match(/^\/giverole\s+Admin\s+(.+)$/i);
    if (!match) return;

    const targetUsername = match[1].trim().toLowerCase();

    // Load sender data
    const senderRef = HYHYHY.firestore().doc(`users/${senderUid}`);
    const senderSnap = await senderRef.get();
    if (!senderSnap.exists) return;

    const sender = senderSnap.data();

    // Sender must be admin
    if (sender.isAdmin !== true) {
      console.log("❌ Unauthorized /giverole attempt by:", sender.username);
      return;
    }

    // Find the target user by username
    const usersSnap = await HYHYHY.firestore().collection("users").get();
    let targetRef = null;

    usersSnap.forEach(doc => {
      const u = doc.data();
      if (u.username && u.username.toLowerCase() === targetUsername) {
        targetRef = doc.ref;
      }
    });

    if (!targetRef) {
      console.log("❌ User not found:", targetUsername);
      return;
    }

    // Update Firestore with admin role
    await targetRef.update({ isAdmin: true });

    console.log(`🔥 Successfully gave ADMIN role to: ${targetUsername}`);
  });

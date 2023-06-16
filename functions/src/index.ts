/* eslint-disable object-curly-spacing */
/* eslint-disable max-len */

import functions = require("firebase-functions");
import admin = require("firebase-admin");
admin.initializeApp();

exports.getRanking = functions
  .region("europe-west1")
  .https.onRequest(async (req, res) => {
    const collectionRef = admin.firestore().collection("users");
    const uid = req.query.uid as string;
    const userData = await collectionRef.doc(uid).get();

    // Mytopia
    const mytopiaPunkte = await userData.data()?.citizenship.mytopia.score;
    const mytopiaQuery = collectionRef.where(
      "citizenship.mytopia.score",
      ">",
      mytopiaPunkte
    );
    const mytopiaSnapshot = await mytopiaQuery.count().get();
    const mytopiaRank = mytopiaSnapshot.data().count + 1;

    // Hyaenen
    const hyaenenPunkte =
      (await userData.data()?.citizenship?.hyaenen?.score) ?? null;
    let hyaenenRank = null;
    if (hyaenenPunkte) {
      const hyaenenQuery = collectionRef.where(
        "citizenship.hyaenen.score",
        ">",
        hyaenenPunkte
      );
      const hyaenenSnapshot = await hyaenenQuery.count().get();
      hyaenenRank = hyaenenSnapshot.data().count + 1;
    }

    // Zirkel

    const zirkelPunkte =
      (await userData.data()?.citizenship?.zirkel?.score) ?? null;
    let zirkelRank = null;
    if (zirkelPunkte) {
      const zirkelQuery = collectionRef.where(
        "citizenship.zirkel.score",
        ">",
        zirkelPunkte
      );
      const zirkelSnapshot = await zirkelQuery.count().get();
      zirkelRank = zirkelSnapshot.data().count + 1;
    }

    const vertrautePunkte =
      (await userData.data()?.citizenship?.vertraute?.score) ?? null;
    let vertrauteRank = null;
    if (vertrautePunkte) {
      const vertrauteQuery = collectionRef.where(
        "citizenship.vertraute.score",
        ">",
        vertrautePunkte
      );
      const vertrauteSnapshot = await vertrauteQuery.count().get();
      vertrauteRank = vertrauteSnapshot.data().count + 1;
    }

    res.json({
      mytopia: mytopiaRank,
      hyaenen: hyaenenRank,
      zirkel: zirkelRank,
      vertraute: vertrauteRank,
    });
  });

exports.newUsers = functions
  .region("europe-west1")
  .auth.user()
  .onCreate((user) => {
    admin.firestore().collection("users").doc(user.uid).create({
      needsEinbuergerung: true,
    });
  });
exports.updateScore = functions
  .region("europe-west1")
  .firestore.document("users/{userId}")
  .onUpdate((change) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    // functions.logger.log(
    //   "new value: ",
    //   newValue,
    //   "previous value: ",
    //   previousValue
    // );

    // Mytopia
    if (
      (newValue?.citizenship?.mytopia?.score ?? 0) !=
      (previousValue?.citizenship?.mytopia?.score ?? 0)
    ) {
      admin
        .firestore()
        .collection("fraktionen")
        .doc("mytopia")
        .update({
          score: admin.firestore.FieldValue.increment(
            (newValue?.citizenship?.mytopia?.score ?? 0) -
              (previousValue?.citizenship?.mytopia?.score ?? 0)
          ),
        });
    }
    // Hyaenen
    if (
      (newValue?.citizenship?.hyaenen?.score ?? 0) !=
      (previousValue?.citizenship?.hyaenen?.score ?? 0)
    ) {
      admin
        .firestore()
        .collection("fraktionen")
        .doc("hyaenen")
        .update({
          score: admin.firestore.FieldValue.increment(
            (newValue?.citizenship?.hyaenen?.score ?? 0) -
              (previousValue?.citizenship?.hyaenen?.score ?? 0)
          ),
        });
    }
    // Zirkel
    if (
      (newValue?.citizenship?.zirkel?.score ?? 0) !=
      (previousValue?.citizenship?.zirkel?.score ?? 0)
    ) {
      admin
        .firestore()
        .collection("fraktionen")
        .doc("zirkel")
        .update({
          score: admin.firestore.FieldValue.increment(
            (newValue?.citizenship?.zirkel?.score ?? 0) -
              (previousValue?.citizenship?.zirkel?.score ?? 0)
          ),
        });
    }
    // Vertraute
    if (
      (newValue?.citizenship?.vertraute?.score ?? 0) !=
      (previousValue?.citizenship?.vertraute?.score ?? 0)
    ) {
      admin
        .firestore()
        .collection("fraktionen")
        .doc("vertraute")
        .update({
          score: admin.firestore.FieldValue.increment(
            (newValue?.citizenship?.vertraute?.score ?? 0) -
              (previousValue?.citizenship?.vertraute?.score ?? 0)
          ),
        });
    }
  });

exports.userDataDeleted = functions
  .region("europe-west1")
  .firestore.document("users/{userId}")
  .onDelete((snap) => {
    admin
      .firestore()
      .collection("fraktionen")
      .doc("mytopia")
      .update({
        score: admin.firestore.FieldValue.increment(
          -snap.data()?.citizenship?.mytopia?.score ?? 0
        ),
      });
    admin
      .firestore()
      .collection("fraktionen")
      .doc("hyaenen")
      .update({
        score: admin.firestore.FieldValue.increment(
          -snap.data()?.citizenship?.hyaenen?.score ?? 0
        ),
      });
    admin
      .firestore()
      .collection("fraktionen")
      .doc("zirkel")
      .update({
        score: admin.firestore.FieldValue.increment(
          -snap.data()?.citizenship?.zirkel?.score ?? 0
        ),
      });
    admin
      .firestore()
      .collection("fraktionen")
      .doc("vertraute")
      .update({
        score: admin.firestore.FieldValue.increment(
          -snap.data()?.citizenship?.vertraute?.score ?? 0
        ),
      });
  });

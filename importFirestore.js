const admin = require("firebase-admin");
const fs = require("fs");

// Load Firebase service account JSON
const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importData() {
  const filePath = "c:/Users/jbusch/Repos/dgenesisinfo/data/explorer_info.json";

  console.log("Reading JSON file...");
  if (!fs.existsSync(filePath)) {
    console.error("Error: JSON file not found at", filePath);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!Array.isArray(data)) {
    console.error("Error: JSON data must be an array of objects.");
    return;
  }

  console.log(`Loaded ${data.length} documents from JSON file.`);

  const batch = db.batch();
  data.forEach((doc, index) => {
    // Ensure `doc.id` is a valid string
    const docId = doc.id && typeof doc.id === "string" && doc.id.trim() !== "" 
      ? doc.id.trim() 
      : `id-${String(index).padStart(3, "0")}`;

    if (!docId) {
      console.error(`Skipping document at index ${index} due to missing ID.`);
      return;
    }

    console.log(`Adding document: ${docId}`);
    const docRef = db.collection("explorer").doc(docId);
    batch.set(docRef, doc);
  });

  console.log("Committing batch to Firestore...");
  await batch.commit();
  console.log("Firestore import complete!");
}

importData().catch((error) => {
  console.error("Error importing data:", error);
});

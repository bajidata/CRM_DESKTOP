import admin from "firebase-admin";
import { verifyIdToken } from "./firebase.js";
import type { IpcMain } from "electron";
import type { SupersetCredential } from "./types.js";

// verify user token and get the user role on firebase
export function registerAuthHandlers(ipcMain: IpcMain) {
  ipcMain.handle("auth:verify", async (_event, token: string) => {
    try {
      const decoded = await verifyIdToken(token);
      const userRecord = await admin.auth().getUser(decoded.uid);
      const userDoc = await admin.firestore().collection("users").doc(decoded.uid).get();
      const role = userDoc.exists ? userDoc.data()?.role ?? "user" : "user";

      return {
        success: true,
        uid: decoded.uid,
        name: userRecord.displayName,
        email: userRecord.email,
        photoURL: userRecord.photoURL,
        role,
      };
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Invalid token" };
    }
  });
}

// collect all supperset account
export async function getSupersetCredentials(): Promise<SupersetCredential[]> {
  const snapshot = await admin
    .firestore()
    .collection("superset_credentials")
    .get();

  return snapshot.docs.map((doc) => {
    // Cast Firestore doc data to your type (except id)
    const data = doc.data() as Omit<SupersetCredential, "id">;
    return { id: doc.id, ...data };
  });
}

// fetch single superset account by id
export async function getSupersetCredential(id: string): Promise<SupersetCredential | null> {
  const doc = await admin
    .firestore()
    .collection("superset_credentials")
    .doc(id)
    .get();

  if (!doc.exists) return null;

  const data = doc.data() as Omit<SupersetCredential, "id">;
  return { id: doc.id, ...data };
}

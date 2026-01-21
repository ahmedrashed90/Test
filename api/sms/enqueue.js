import admin from "firebase-admin";

function parseServiceAccountFromEnv() {
  // Prefer a full service account JSON to avoid OpenSSL/\n issues.
  const raw =
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    "";

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "";

  let jsonText = "";
  if (b64) {
    try {
      jsonText = Buffer.from(b64, "base64").toString("utf8");
    } catch (e) {
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT*_BASE64 (cannot decode base64).");
    }
  } else if (raw) {
    jsonText = raw;
  }

  if (!jsonText) return null;

  // Some people paste JSON with surrounding quotes; strip them safely.
  const trimmed = String(jsonText).trim();
  const cleaned =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  let obj;
  try {
    obj = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }

  if (!obj.project_id || !obj.client_email || !obj.private_key) {
    throw new Error("Service account JSON missing required keys: project_id, client_email, private_key.");
  }

  // Ensure newlines are real
  obj.private_key = String(obj.private_key).replace(/\\n/g, "\n");

  // Sanity check
  if (!obj.private_key.includes("BEGIN") || !obj.private_key.includes("END")) {
    throw new Error("Service account private_key looks invalid (missing BEGIN/END).");
  }

  return {
    projectId: obj.project_id,
    clientEmail: obj.client_email,
    privateKey: obj.private_key,
  };
}

function initAdmin() {
  if (admin.apps.length) return;

  // 1) Best: full service account JSON
  const sa = parseServiceAccountFromEnv();
  if (sa) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: sa.projectId,
        clientEmail: sa.clientEmail,
        privateKey: sa.privateKey,
      }),
    });
    return;
  }

  // 2) Fallback: split env vars
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  const privateKey =
    process.env.FIREBASE_PRIVATE_KEY_BASE64
      ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8")
      : (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin ENV. Provide either FIREBASE_SERVICE_ACCOUNT_JSON (recommended) or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY(_BASE64)."
    );
  }

  if (!privateKey.includes("BEGIN") || !privateKey.includes("END")) {
    throw new Error("Invalid Firebase private key format (missing BEGIN/END lines).");
  }

  // If someone provided an RSA PKCS#1 key, it can fail on some OpenSSL 3 builds.
  // Recommend using the service account JSON (PKCS#8) if this keeps failing.
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    initAdmin();

    // Firebase Auth Bearer Token (multi-user safe)
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return res.status(401).send("Missing token");

    await admin.auth().verifyIdToken(token);

    const { phone, to, message, source, meta } = req.body || {};
    const target = String(phone || to || "").trim();
    if (!target || !message) return res.status(400).send("phone/to & message required");

    const docRef = await admin.firestore().collection("sms_outbox").add({
      to: target,
      phone: target,
      message: String(message),
      source: String(source || "web"),
      meta: meta || {},
      status: "queued",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ ok: true, id: docRef.id });
  } catch (e) {
    return res.status(500).send(String(e?.message || e));
  }
}

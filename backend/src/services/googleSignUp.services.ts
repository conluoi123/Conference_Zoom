import { ENV } from "../configs/env";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: ENV.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}
export { verifyGoogleToken }
import { Resend } from "resend";
import { ENV } from "./env";
const resend = new Resend(ENV.RESEND_EMAIL_API_KEY);
export { resend };

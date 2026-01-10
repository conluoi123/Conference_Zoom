import SibApiV3Sdk from "sib-api-v3-sdk";
import { ENV } from "./env";

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = ENV.BREVO_API_KEY!;

export const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailApi = void 0;
const sib_api_v3_sdk_1 = __importDefault(require("sib-api-v3-sdk"));
const env_1 = require("./env");
const client = sib_api_v3_sdk_1.default.ApiClient.instance;
client.authentications["api-key"].apiKey = env_1.ENV.BREVO_API_KEY;
exports.emailApi = new sib_api_v3_sdk_1.default.TransactionalEmailsApi();
//# sourceMappingURL=brevo.js.map
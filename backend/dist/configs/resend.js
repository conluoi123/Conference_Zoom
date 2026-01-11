"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resend = void 0;
const resend_1 = require("resend");
const env_1 = require("./env");
const resend = new resend_1.Resend(env_1.ENV.RESEND_EMAIL_API_KEY);
exports.resend = resend;
//# sourceMappingURL=resend.js.map
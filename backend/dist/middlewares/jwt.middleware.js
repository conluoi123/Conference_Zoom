"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAccessToken = authenticateAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../configs/env");
function authenticateAccessToken(req, res, next) {
    try {
        const authorization_code = req.headers["authorization"];
        if (!authorization_code) {
            return res.status(401).json({ message: "ACCESS TOKEN NOT FOUND" });
        }
        const token = authorization_code.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "ACCESS TOKEN NOT FOUND" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET); // Payload
        if (!decoded) {
            return res.status(401).json({ message: "ACCESS TOKEN IS EXPIRED" });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res
            .status(401)
            .json({ message: "ACCESS TOKEN IS EXPIRED OR WRONG" });
    }
}
//# sourceMappingURL=jwt.middleware.js.map
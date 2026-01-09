"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenRouter = void 0;
const express_1 = require("express");
const refreshAccessToken_services_1 = __importDefault(require("../services/refreshAccessToken.services"));
const refreshTokenRouter = (app) => {
    const router = (0, express_1.Router)();
    router.post("/refreshToken", refreshAccessToken_services_1.default);
    app.use("/auth", router);
};
exports.refreshTokenRouter = refreshTokenRouter;
//# sourceMappingURL=refreshAccessToken.routes.js.map
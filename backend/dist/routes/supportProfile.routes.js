"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportProfileRouter = void 0;
const express_1 = require("express");
const supportProfile_controller_1 = require("../controllers/supportProfile.controller");
const jwt_middleware_1 = require("../middlewares/jwt.middleware");
const supportProfileRouter = (app) => {
    const router = (0, express_1.Router)();
    router.post("/saveAvatar", jwt_middleware_1.authenticateAccessToken, supportProfile_controller_1.saveAvatar);
    router.get("/signature", jwt_middleware_1.authenticateAccessToken, supportProfile_controller_1.signatureCloudinary);
    app.use("", router);
};
exports.supportProfileRouter = supportProfileRouter;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const logout_controller_1 = require("../controllers/logout.controller");
const logoutRouter = (app) => {
    const router = (0, express_1.Router)();
    router.post("/logout", logout_controller_1.logout);
    app.use("/auth", router);
};
exports.default = logoutRouter;
//# sourceMappingURL=logout.routes.js.map
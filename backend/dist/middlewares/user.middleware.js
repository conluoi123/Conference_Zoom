"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const userMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let id = "";
    if (req.body && req.body.userId) {
        const { userId } = req.body;
        id = userId;
    }
    else if (req.query && req.query.userId) {
        const { userId } = req.query;
        id = userId.toString();
    }
    else if (req.params && req.params.id) {
        id = req.params.id;
    }
    const user = yield user_model_1.default.findOne({ _id: id });
    if (!id || !user) {
        res.status(404).json("Tài khoản không tồn tại!");
    }
    res.locals.userInfo = user;
    next();
});
exports.userMiddleware = userMiddleware;

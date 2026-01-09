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
exports.getUserMeetingHistory = exports.getUser = exports.updateUserInfo = exports.getUserInfo = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const participant_services_1 = require("../services/participant.services");
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json("Tài khoản không tồn tại!");
        }
        const data = {
            userId: user._id,
            email: user.email,
            displayName: user.displayName,
            avatar: user.avatar,
        };
        return res.status(200).json({ data });
    }
    catch (error) {
        console.error("Error when get user");
    }
});
exports.getUser = getUser;
const getUserInfo = (req, res) => {
    const userInfo = res.locals.userInfo;
    return res.status(200).json(userInfo);
};
exports.getUserInfo = getUserInfo;
const updateUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, displayName, avatar, accountType } = req.body;
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, {
        $set: { displayName, avatar, accountType }, // Mongoose tự động bỏ qua nếu giá trị là undefined
    }, { new: true } // Option này để trả về dữ liệu MỚI sau khi update
    );
    return res.status(200).json(updatedUser);
});
exports.updateUserInfo = updateUserInfo;
const getUserMeetingHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const roomInfo = yield (0, participant_services_1.getMeetingHistory)(userId);
        res.status(200).json(roomInfo);
    }
    catch (error) {
        res.status(500).json(`Interal Server Error: ${error}`);
    }
});
exports.getUserMeetingHistory = getUserMeetingHistory;
//# sourceMappingURL=user.controller.js.map
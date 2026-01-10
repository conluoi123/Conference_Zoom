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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionRecord = void 0;
const recording_services_1 = require("../services/recording.services");
const room_services_1 = require("../services/room.services");
const getSessionRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sessionId = req.params.sessionId;
        const roomId = req.params.roomId;
        const { id, email } = req.user;
        const records = yield (0, recording_services_1.getRecording)(sessionId);
        const urls = [];
        const userIsHost = yield (0, room_services_1.isHost)(roomId, id);
        records.forEach((record) => {
            if (userIsHost || record.shared.includes(email)) {
                urls.push(record.fileUrl);
            }
        });
        res.status(200).json(urls);
    }
    catch (error) {
        res.status(500).json("Internal Server Error");
    }
});
exports.getSessionRecord = getSessionRecord;

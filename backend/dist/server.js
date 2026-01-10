"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
//Nodejs express
const express_session_1 = __importDefault(require("express-session"));
const express_1 = __importDefault(require("express"));
//SocketIO and WebRTC
const http_1 = require("http");
//middlewares
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
//configs
const env_1 = require("./configs/env");
const db_1 = require("./configs/db");
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const webhook_routes_1 = __importDefault(require("./routes/webhook.routes"));
const user_routes_1 = require("./routes/user.routes");
const signIn_routes_1 = require("./routes/signIn.routes");
const socketHandler_1 = require("./socket/socketHandler");
const refreshAccessToken_routes_1 = require("./routes/refreshAccessToken.routes");
const logout_routes_1 = __importDefault(require("./routes/logout.routes"));
const supportProfile_routes_1 = require("./routes/supportProfile.routes");
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const agenda_1 = __importStar(require("./configs/agenda"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const recording_routes_1 = require("./routes/recording.routes");
const PORT = env_1.ENV.PORT || 10000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.ENV.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
}));
app.use((0, cookie_parser_1.default)());
//middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
app.use((0, express_session_1.default)({
    name: "connect.sid",
    secret: env_1.ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 60 * 60 * 1000,
    },
}));
const server = (0, http_1.createServer)(app);
const io = (0, socketHandler_1.initSocket)(server);
//Khởi động agenda
(0, agenda_1.startAgenda)();
(0, socketHandler_1.socketHandler)(io);
//Login - Logout
(0, signIn_routes_1.signInRouter)(app);
(0, signIn_routes_1.sendOtpRouter)(app);
(0, signIn_routes_1.verifyOtpRouter)(app);
(0, signIn_routes_1.outlookSignInRouter)(app);
(0, logout_routes_1.default)(app);
//Authenticate Token
(0, refreshAccessToken_routes_1.refreshTokenRouter)(app);
//App
(0, user_routes_1.userRoutes)(app);
(0, room_routes_1.default)(app);
(0, recording_routes_1.recordingRoutes)(app);
(0, webhook_routes_1.default)(app);
(0, supportProfile_routes_1.supportProfileRouter)(app);
(0, notification_routes_1.default)(app);
(0, schedule_routes_1.default)(app);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.connectDB)();
        server.listen(PORT, () => {
            console.log(`Server is listening on port: ${PORT}`);
        });
    }
    catch (err) {
        console.log(err);
    }
});
startServer();
//Tat agenda tranh tinh trang treo
const graceful = () => __awaiter(void 0, void 0, void 0, function* () {
    yield agenda_1.default.stop();
    server.close(() => {
        process.exit(0);
    });
    setTimeout(() => {
        process.exit(1);
    }, 10000);
});
process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);

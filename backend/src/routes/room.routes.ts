import { Router, Express } from "express";
import {
  createNewRoom,
  getRoomScheduleByInvitedUser,
  userJoinRoom,
  getInvietedUsersBySchedule,
  getSessionRecord,
  getAllRecordings,
  shareRecordingController,
  deleteRecording,
  startRecordingController,
} from "../controllers/room.controller";
import {
  createRoomMiddleware,
  joinRoomMiddleware,
} from "../middlewares/room.middleware";
import { authenticateAccessToken } from "../middlewares/jwt.middleware";

/*
  Tạo phòng
  Tham gia phòng
  Rời phòng
  Lấy thông tin phòng
*/

const router = Router();
const roomRoutes = (app: Express) => {
  router.post(
    "/schedule/invited-users",
    authenticateAccessToken,
    getInvietedUsersBySchedule
  );
  router.get(
    "/schedule",
    authenticateAccessToken,
    getRoomScheduleByInvitedUser
  );
  router.post(
    "/create",
    authenticateAccessToken,
    createRoomMiddleware,
    createNewRoom
  );
  router.post(
    "/:roomId/join",
    authenticateAccessToken,
    joinRoomMiddleware,
    userJoinRoom
  );
  router.get(
    "/:roomId/recordings/:sessionId",
    authenticateAccessToken,
    getSessionRecord
  );
  
  // Lấy tất cả recordings của user
  router.get(
    "/recordings",
    authenticateAccessToken,
    getAllRecordings
  );

  // Chia sẻ recording với emails
  router.post(
    "/recordings/:sessionId/share",
    authenticateAccessToken,
    shareRecordingController
  );

  // Xóa recording
  router.delete(
    "/recordings/:sessionId",
    authenticateAccessToken,
    deleteRecording
  );

  // Bắt đầu recording
  router.post(
    "/recordings/start",
    authenticateAccessToken,
    startRecordingController
  );

  app.use("/rooms", router);
};

export default roomRoutes;

import Room from "../models/room.model";
import { Request, Response } from "express";
import {
  createRoomOnDatabase,
  createRoomOnVideoSDK,
  generateToken,
  getRoomShedule,
  getRoomSheduleInvited,
  isHost,
  isInvitedForRoom,
} from "../services/room.services";
import { isInvitedForSession } from "../services/session.services";
import { isDueSchedule, latestSchedule } from "../services/schedule.services";
import {
  getRecording,
  getAllRecordingsByUser,
  shareRecording,
  deleteRecording as deleteService,
  startRecording,
} from "../services/recording.services";
import User from "../models/user.model";
import { RequestWithUser } from "./signIn.controller";
import Record from "../models/recording.model";
import { ENV } from "../configs/env";
const createNewRoom = async (req: Request, res: Response) => {
  try {
    const { peerId, title, meetingType } = req.body;

    const roomId = await createRoomOnVideoSDK();

    await createRoomOnDatabase({ roomId, peerId, title, meetingType });

    const token = generateToken("host", peerId, roomId);

    return res.status(200).json({ roomId, hostId: peerId, token });
  } catch (error: any) {
    console.error("Tạo phòng:", error.message);

    if (error.message.includes("Lỗi VideoSDK")) {
      return res.status(502).json({ error: error.message });
    }

    // Lỗi server/DB nói chung
    return res.status(500).json({ error: "Tạo phòng thất bại!" });
  }
};

const userJoinRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, peerId } = req.body;
    const room = res.locals.roomInfo;

    if (room.type === "SCHEDULED") {
      const schedule = await latestSchedule(roomId);
      if (!isDueSchedule(schedule))
        return res.status(403).json("Chưa đến thời gian vào phòng họp");
    }

    let userType = "peer";
    if (peerId === room.hostId) userType = "host";
    if (
      (await isInvitedForRoom(roomId, peerId)) ||
      (await isInvitedForSession(roomId, peerId)) ||
      room.settings.allowJoin
    ) {
      userType = "invitee";
    }

    const token = generateToken(userType, peerId, roomId);

    /*
      Thêm user vào danh sách Participants để share record
    */
    try {
      const user = await User.findById(peerId);
      if (user && room) {
        await Room.findOneAndUpdate(
          { roomId },
          { $addToSet: { participants: user.email } }
        );

        // share cho cả người mới join vào phòng
        await Record.updateMany(
          { roomId: roomId },
          { $addToSet: { shared: user.email } }
        );
      }
    } catch (err) {
      console.error("Lỗi tự share record");
    }

    return res.status(200).json({
      hostId: room.hostId,
      settings: room.settings,
      token: token,
      webhookUrl: ENV.VIDEOSDK_WEBHOOK_URL,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};

const getRoomScheduleByInvitedUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "userId is not found" });
    }
    const roomIds = await getRoomShedule(userId as string, "roomId");
    const hostIds = await getRoomShedule(userId as string, "hostId");
    const startTimes = await getRoomShedule(userId as string, "startTime");
    return res.status(200).json({ roomIds, hostIds, startTimes });
  } catch (error) {
    console.error("getRoomScheduleByInvitedUser error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getInvietedUsersBySchedule = async (req: Request, res: Response) => {
  try {
    const { roomId, hostId } = req.body;
    if (!roomId || !hostId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const invitedUsers = await getRoomSheduleInvited(roomId, hostId);
    return res.status(200).json({ invitedUsers });
  } catch (error) {
    console.error("getInvietedUsersBySchedule error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
/*
  Phiên record 
*/
const getSessionRecord = async (req: RequestWithUser, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    const roomId = req.params.roomId;
    const { id, email } = req.user;
    const record = await getRecording(sessionId);

    // Kiểm tra xem có phải là host hay người được shared hay ko
    let userIsHost = await isHost(roomId, id);
    let isShared = record.shared.includes(email);

    if (!userIsHost && !isShared) {
      return res.status(403).json({ error: "Không có quyền xem bản ghi này" });
    }
    return res.status(200).json(record);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

/*
  Lấy tất cả recording mà user có quyền xem
*/
const getAllRecordings = async (req: RequestWithUser, res: Response) => {
  try {
    const { id, email } = req.user;
    console.log("Lấy danh sách record cho ", { id, email });
    const records = await getAllRecordingsByUser(id, email);
    console.log("📊 Found recordings:", records.length);
    console.log("📝 Records data:", JSON.stringify(records, null, 2));

    return res.status(200).json({recordings: records}); 
  } catch (err) {
    console.error("getAllRecordings error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


/*
  Chia sẻ 
*/

// Chia sẻ recording với danh sách emails
const shareRecordingController = async (req: RequestWithUser, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    const { emails } = req.body; // Mảng emails
    const { id } = req.user;

    // Kiểm tra xem user có phải là host không
    const record = await getRecording(sessionId);
    // Lấy room tương ứng để kiểm tra hostId thật của phòng
    const room = await Room.findOne({ roomId: record.roomId });

    if (!room || room.hostId !== id) {
      return res.status(403).json({ error: "Chỉ chủ phòng mới có quyền chia sẻ bản ghi này" });
    }

    const updatedRecord = await shareRecording(sessionId, emails);

    return res.status(200).json({
      message: "Chia sẻ thành công",
      record: updatedRecord
    });
  } catch (error: any) {
    console.error("shareRecordingController error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Xóa recording (chỉ host)
const deleteRecording = async (req: RequestWithUser, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    const { id } = req.user;

    // TODO: Kiểm tra xem user có phải là host không
    // const record = await getRecording(sessionId);
    // const userIsHost = await isHost(roomId, id);
    // if (!userIsHost) {
    //   return res.status(403).json({ error: "Chỉ host mới có thể xóa recording" });
    // }

    await deleteService(sessionId);

    return res.status(200).json({ message: "Xóa recording thành công" });
  } catch (error: any) {
    console.error("deleteRecording error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Bắt đầu recording - tạo record trong database
const startRecordingController = async (req: RequestWithUser, res: Response) => {
  try {
    const { sessionId, roomId } = req.body;
    const { id: hostId } = req.user; // Lấy hostId từ user đang login

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    console.log("🔴 Starting recording:", { sessionId, roomId, hostId });

    await startRecording({ sessionId, roomId, hostId });

    return res.status(200).json({
      message: "Recording started",
      sessionId
    });
  } catch (error: any) {
    console.error("startRecordingController error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export {
  createNewRoom,
  userJoinRoom,
  getRoomScheduleByInvitedUser,
  getInvietedUsersBySchedule,
  getSessionRecord,
  getAllRecordings,
  shareRecordingController,
  deleteRecording,
  startRecordingController,
};

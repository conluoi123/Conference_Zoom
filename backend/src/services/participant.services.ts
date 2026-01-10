import Participant from "../models/participant.model";
import User from "../models/user.model";
import { findRoomOnDatabase } from "./room.services";
import { findProgressingSession } from "./session.services";

const onParticipantJoined = async (data) => {
  try {
    const participant = await Participant.findOneAndUpdate(
      {
        sessionId: data.sessionId,
        participantId: data.participantId,
        roomId: data.meetingId,
      },
      {
        $set: {
          leaveTime: null,
          displayName: data.participantName,
        },
        $setOnInsert: {
          joinTime: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return participant;
  } catch (error) {
    console.error("Error handling participant joined:", error);
  }
};

const onParticipantLeft = async (data) => {
  const participant = await Participant.findOneAndUpdate(
    {
      sessionId: data.sessionId,
      participantId: data.participantId,
      roomId: data.meetingId,
    },
    {
      $set: { leaveTime: new Date() },
    },
    { new: true }
  );

  if (!participant) {
    throw new Error("Người tham gia không tồn tại");
  }
};

//trong data của webhook có roomId
//RoomId luon ton tai

const getMeetingHistory = async (participantId: string) => {
  const history = await Participant.find({ participantId }).sort({
    leaveTime: -1,
  });

  const roomInfo = await Promise.all(
    history.map(async (data) => {
      const room = await findRoomOnDatabase(data.roomId);

      // Import Recording model at top of file if not already imported
      const Record = require("../models/recording.model").default;
      const recordings = await Record.find({ sessionId: data.sessionId });

      return {
        roomId: room?.roomId || data.roomId,
        sessionId: data.sessionId,
        title: room?.title || "Cuộc họp",
        start: data.joinTime,
        hasRecording: recordings.length > 0,
      };
    })
  );

  return roomInfo;
};

const isAlreadyJoined = async (roomId, email: string) => {
  const session = await findProgressingSession(roomId);
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("Người dùng chưa đăng ký");
  }
  const participant = await Participant.findOne({
    participantId: user._id,
    sessionId: session.sessionId,
    roomId: roomId,
  });
  if (!participant || participant.leaveTime === null) return false;
  return true;
};

export {
  onParticipantJoined,
  onParticipantLeft,
  getMeetingHistory,
  isAlreadyJoined,
};

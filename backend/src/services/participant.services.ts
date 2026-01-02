import Participant from "../models/participant.model";
import { findRoomOnDatabase } from "./room.services";

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
        hasRecording: recordings.length > 0
      };
    })
  );

  return roomInfo;
};

export { onParticipantJoined, onParticipantLeft, getMeetingHistory };

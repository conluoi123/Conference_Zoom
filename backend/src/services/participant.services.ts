import Participant from "../models/participant.model";

const onParticipantJoined = async (data) => {
  const participant = await Participant.findOne({
    sessionId: data.sessionId,
    participantId: data.participantId,
  });
  if (!participant) {
    await Participant.create({
      participantId: data.participantId,
      sessionId: data.sessionId,
      displayName: data.participantName,
      joinTime: new Date(),
    });
    return;
  }
  participant.leaveTime = null;
  await participant.save();
};

const onParticipantLeft = async (data) => {
  const participant = await Participant.findOne({
    sessionId: data.sessionId,
    participantId: data.participantId,
  });
  if (!participant) {
    throw new Error("Người tham gia không tồn tại");
  }
  participant.leaveTime = new Date();
  await participant.save();
};

export { onParticipantJoined, onParticipantLeft };

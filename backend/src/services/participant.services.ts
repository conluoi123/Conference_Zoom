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
  participant.joinTime = new Date();
  participant.leaveTime = null;
};

export { onParticipantJoined };

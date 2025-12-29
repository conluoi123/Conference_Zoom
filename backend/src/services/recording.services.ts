import Record from "../models/recording.model";

const startRecording = async (data) => {
  const record = await Record.create({
    sessionId: data.sessionId,
    createdAt: new Date(),
  });
  if (!record) {
    throw new Error("Không thể tạo bản ghi");
  }
};

const endRecording = async (data) => {
  const record = await Record.findOneAndUpdate(
    { sessionId: data.sessionId },
    {
      $set: { fileUrl: data.fileUrl },
    },
    { new: true }
  );
  if (!record) {
    throw new Error("Không tìm thấy bản ghi");
  }
};

export { startRecording, endRecording };

import Record from "../models/recording.model";

const startRecording = async (data) => {
  const record = await Record.create({
    sessionId: data.sessionId,
    createdAt: new Date(),
    shared: [],
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

const shareRecording = async (sessionId, emails) => {
  const record = await Record.findOneAndUpdate(
    { sessionId: sessionId },
    {
      $addToSet: {
        shared: { $each: emails },
      },
    },
    { new: true }
  );
  return record;
};

/**Từ lịch sử các cuộc họp tham gia có nút view recordings, bấm vào nếu có thì hiện kh thì thôi */
const getRecording = async (sessionId: string) => {
  const records = await Record.find({ sessionId });
  if (!records) {
    throw new Error("Không có bản ghi được chia sẻ cho phiên họp này");
  }
  return records;
};

export { startRecording, endRecording, getRecording, shareRecording };

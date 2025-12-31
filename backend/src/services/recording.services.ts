import Record from "../models/recording.model";
import { ENV } from "../configs/env";
import { generateToken } from './room.services'
import mongoose from "mongoose";


/*
  Xử lí nút bấm Start Recording 
  Vì videoSDK xử lí sessionID khá chậm. Ban đầu FE chỉ biết roomId nên ta cho roomId = sessionId luôn;  nhưng khi kết thúc lại dùng sessionId để lấy => Vì vậy 
  phải có phần xử lí nhỏ ở chỗ này. 
  - Xử lí thêm trường hợp shared nữa, ai vào phòng thì được share video record lun 
*/
const startRecording = async (data) => {
  // 1. Kiểm tra đã có record với sessionId này chưa 
  let record = await Record.findOne({ sessionId: data.sessionId })

  if (record) {
    console.log("Đã tồn tại bản ghi cho session này!", data.sessionId);
    return record;
  }

  // 2. Nếu ko có trong DB, thì có 2 trường hợp xảy ra 

  // th1: Kiểm tra xem có record nào đang dùng roomId làm sessionId tạm thời ko
  record = await Record.findOne({
    roomId: data.roomId,
    sessionId: data.roomId
  })

  if (record) {
    console.log("Updated record with REAL session", data.sessionId);
    record.sessionId = data.sessionId;
    await record.save();
    return record;
  }
  // xử lí lấy danh sách participant 
  /*
    Khai báo một mảng gồm chuỗi các participantId 
    HostId là người ghi
  */
  let roomParticipants : string[] = []; 
  let roomHostId = data.hostId; 

  try{
    const RoomModel = mongoose.model("room"); 
    const room = await RoomModel.findOne({roomId : data.roomId}); // tìm room trên database 
    if(room) {
      if(room.participants && room.participants.length > 0) {
        roomParticipants = room.participants;
        console.log(`👥 Tìm thấy ${roomParticipants.length} người tham gia để tự động share.`);
      }
    }
  } catch(err){
    console.error("Lỗi lấy thông tin Room để auto-shared", err);
  }

  // th2: tạo mới
  console.log("CREATED new record")
  record = await Record.create({
    sessionId: data.sessionId,
    roomId: data.roomId,
    createdAt: new Date(),
    hostId: data.hostId,
    shared: roomParticipants
  })
  return record;

  // const record = await Record.create({
  //   sessionId: data.sessionId,
  //   createdAt: new Date(),
  //   shared: [],
  // });
  // if (!record) {
  //   throw new Error("Không thể tạo bản ghi");
  // }
};
/*
  $set: toán tử update của MongoDB: 
  - chưa có -> tạo mới
  - có rồi -> ghi đè 
  $addToSet: thêm phần tử vào bảng
  - có rồi -> ko thêm 
  - chưa có -> thêm 
*/

const endRecording = async (data) => {
  /*
    Khi kết thúc việc ghi hình VideoSDk gửi webhook về, và hàm này sẽ hứng 
    cái đó và update trở ngược lại cho database
    Làm như thế này để khi mà VideoSDk xử lí lâu thì dẫn đến url của video sẽ luôn là null 
    Thay vì như vậy chúng ta sẽ chờ và liên tục yêu cầu videoSDk trả link 
  */
  const record = await Record.findOneAndUpdate(
    // Tìm lại bản ghi đó trong database có thể là roomId, có thể là sessionId 
    {
      $or: [
        { sessionId: data.sessionId },
        { sessionId: data.roomId || data.meetingId }
      ]
    },
    
    {
      $set: { 
        fileUrl: data.fileUrl, 
        sessionId: data.sessionId
      },
    },
    { new: true }
  );
  if (!record) {
    throw new Error("Không tìm thấy bản ghi");
  }
  console.log("Cập nhật file URL thành công ")
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


/*
  Vì VideoSDK mất cả thể vài phút để tạo ra link nên chúng 
  ta cần có một hàm gọi cho tới khi nào có fileUrl thì thôi
*/
const syncRecordingWithVideoSDK = async (sessionId: string, roomId: string) => {
  try {
    console.log(`🔄 Proactively syncing recording for session: ${sessionId} (Room: ${roomId})`);
    const token = generateToken("server");

    // Nếu sessionId trùng với roomId -> đây là ID tạm thời từ frontend
    // Ta nên hỏi VideoSDK tất cả recordings của roomId này để tìm sessionId thật
    const isTempId = sessionId === roomId;
    const queryParams = isTempId ? `roomId=${roomId}` : `roomId=${roomId}&sessionId=${sessionId}`;

    const url = `${ENV.VIDEOSDK_API_ENDPOINT}/recordings?${queryParams}`;
    const options = {
      method: "GET",
      headers: { Authorization: token },
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ VideoSDK API Error (${response.status}):`, errorText);
      return null;
    }

    const result = await response.json();
    console.log("📡 VideoSDK API Result Data Count:", result.data?.length);

    if (result.data && result.data.length > 0) {
      // Tìm recording có fileUrl
      const recordingInfo = result.data.find((r: any) => {
        const hasFile = r.file && r.file.fileUrl;
        if (hasFile) console.log(`🎯 Found candidate: sessionId=${r.sessionId}, fileUrl=${r.file.fileUrl}`);
        return hasFile;
      });

      if (recordingInfo) {
        const realFileUrl = recordingInfo.file.fileUrl;
        const realSessionId = recordingInfo.sessionId;

        console.log("✅ Found recording data via API pull. Syncing...");
        console.log(`🔗 Link: ${realFileUrl}`);
        console.log(`🆔 Real SessionId: ${realSessionId}`);

        const updatedRecord = await Record.findOneAndUpdate(
          {
            $or: [
              { sessionId: sessionId },
              { roomId: roomId }
            ]
          },
          {
            $set: {
              fileUrl: realFileUrl,
              sessionId: realSessionId
            }
          },
          { new: true }
        );
        return updatedRecord;
      } else {
        console.log("⚠️ No item in data array has a file.fileUrl");
      }
    } else {
      console.log("⚠️ result.data is empty or missing");
    }
    return null;
  } catch (error) {
    console.error("❌ Failed to sync with VideoSDK:", error);
    return null;
  }
};

/**
  - Từ lịch sử các cuộc họp tham gia có nút view recordings,
  bấm vào nếu có thì hiện kh thì thôi 
  
  -- cái này sẽ xử lí sau. 
  */
const getRecording = async (sessionId: string) => {
  const record = await Record.findOne({ sessionId });
  if (!record) {
    throw new Error("Không có bản ghi được chia sẻ cho phiên họp này");
  }
  return record;
};
/*
  Lấy tất cả recordings mà user có quyền xem (host hoặc ở trong danh sách shared)
*/
const getAllRecordingsByUser = async (userId: string, email: string) => {
  const records = await Record.find({
    $or : [
      {hostId: userId}, 
      {shared: {$in: [email]} }
    ]
  }).sort({createdAt: -1});
  console.log(`📊 Found ${records.length} recordings for user ${userId} (${email})`);
  
  // Xử lí những bản ghi vẫn đang còn bị fileUrl là null 
  const recordMissUrl = records.filter(r=> !r.fileUrl).map(r=>syncRecordingWithVideoSDK(r.sessionId, r.roomId));
  if(recordMissUrl.length> 0){
    console.log("Tiến hành xử lí"); 
    await Promise.all(recordMissUrl);

    // Sau khi xử lí xong lấy lại dữ liệu mới, cập nhật DB 
    return await Record.find({
      $or: [
        {hostId: userId}, 
        { shared: { $in: [email] } },
      ]
    }).sort({createdAt: -1});
  }
  return records;
}
/*
  Xóa video khỏi databse 
*/

const deleteRecording = async (sessionId: string) => {
  const record = await Record.findOneAndDelete({sessionId})
  if(!record) {
    throw new Error("Không tim thấy bản ghi!")
  }
  return record;
} 

export { startRecording, endRecording, getRecording, shareRecording, getAllRecordingsByUser, deleteRecording };

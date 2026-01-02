import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL;

class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private currentEmail: string | null = null;

  constructor() {
    this.socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      autoConnect: false,
    });

    // Đăng ký các event chung một lần
    this.setupBaseListeners();
  }

  private setupBaseListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket?.id);
      console.log("📧 Email hiện tại:", this.currentEmail);
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });
  }

  // ============ CONNECTION ============
  connect(email: string) {
    if (!this.socket) return;

    // Nếu đã kết nối với cùng email, không làm gì cả
    if (this.socket.connected && this.currentEmail === email) {
      console.log("⚠️ Socket đã kết nối với email này rồi");
      return;
    }

    // Nếu đang kết nối, không connect lại
    if (this.isConnecting) {
      console.log("⏳ Socket đang trong quá trình kết nối...");
      return;
    }

    this.isConnecting = true;
    this.currentEmail = email;

    // Cập nhật email vào query
    this.socket.io.opts.query = { email };

    if (!this.socket.connected) {
      this.socket.connect();
    }

    this.isConnecting = false;
  }

  disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.currentEmail = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // ============ MEETING EVENTS ============
  joinMeetingRoom(roomId: string, participantName: string) {
    if (!this.socket?.connected) {
      console.error("❌ Socket chưa kết nối, không thể join room");
      return;
    }
    console.log(`🚪 Joining meeting room: ${roomId}`);
    this.socket.emit("meeting:join", { roomId, participantName });
  }

  leaveMeetingRoom(roomId: string, participantName: string) {
    if (!this.socket?.connected) return;
    console.log(`🚪 Leaving meeting room: ${roomId}`);
    this.socket.emit("meeting:leave", { roomId, participantName });
  }

  sendChatMessage(payload: {
    roomId: string;
    avatar: string;
    content: string;
    participantName: string;
    participantId: string;
  }) {
    if (!this.socket?.connected) {
      console.error("❌ Socket chưa kết nối, không thể gửi tin nhắn");
      return;
    }
    this.socket.emit("meeting:chat", {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  // ============ INVITATION EVENTS ============
  inviteByEmail(roomId: string, participantId: string, emails: string[]) {
    if (!this.socket?.connected) {
      console.error("❌ Socket chưa kết nối");
      return;
    }

    if (!emails || emails.length === 0) {
      console.warn("⚠️ Danh sách email trống");
      return;
    }

    console.log(`📨 Mời ${emails.length} người vào phòng ${roomId}`);
    this.socket.emit("meeting:invite", { roomId, participantId, emails });
  }

  updateMeetingSettings(roomId: string, participantId: string, settings: any) {
    if (!this.socket?.connected) return;
    this.socket.emit("meeting:settings", { roomId, participantId, settings });
  }

  respondToInvitation(
    scheduleId: string,
    email: string,
    status: "accepted" | "declined"
  ) {
    if (!this.socket?.connected) return;
    this.socket.emit("notification:invitation", { scheduleId, email, status });
  }

  // ============ LISTENERS ============
  onMeetingJoin(callback: (message: string) => void) {
    this.socket?.on("meeting:join", callback);
  }

  onMeetingLeave(callback: (message: string) => void) {
    this.socket?.on("meeting:leave", callback);
  }

  onChatMessage(callback: (message: any) => void) {
    this.socket?.on("meeting:chat", callback);
  }

  onChatHistory(callback: (messages: any[]) => void) {
    this.socket?.on("meeting:chat-history", callback);
  }
  /*
    on: đăng ký lắng nghe 
    callback: nhận vào một function, có type là (message, roomid)
    
  */
  onMeetingInviteNotification(
    callback: (data: { message: string; roomId: string }) => void
  ) {
    this.socket?.on("notification:meeting", callback);
  }

  onScheduleNotification(callback: (message: string) => void) {
    this.socket?.on("notification:schedule", callback);
  }

  onMeetingSettingsUpdated(callback: (settings: any) => void) {
    this.socket?.on("meeting:settings_updated", callback);
  }

  // ============ RECORDING EVENTS ============
  shareRecording(userId: string, roomId: string, sessionId: string, emails: string[]) {
    if (!this.socket?.connected) {
      console.error("❌ Socket chưa kết nối");
      return;
    }

    if (!emails || emails.length === 0) {
      console.warn("⚠️ Danh sách email trống");
      return;
    }

    console.log(`📹 Chia sẻ recording ${sessionId} cho ${emails.length} người`);
    this.socket.emit("recording:share", userId, roomId, sessionId, emails);
  }

  onRecordingShared(callback: (data: {
    roomId: string;
    sessionId: string;
    message: string
  }) => void) {
    this.socket?.on("notification:recording", callback);
  }

  // ============ CLEANUP ============
  offMeetingEvents() {
    this.socket?.off("meeting:join");
    this.socket?.off("meeting:leave");
    this.socket?.off("meeting:chat");
    this.socket?.off("meeting:chat-history");
    this.socket?.off("meeting:settings_updated");
  }

  offNotificationEvents() {
    this.socket?.off("notification:schedule");
    this.socket?.off("notification:meeting");
    this.socket?.off("notification:recording");
  }

  offAllEvents() {
    this.offMeetingEvents();
    this.offNotificationEvents();
  }
}


export const socketService = new SocketService();


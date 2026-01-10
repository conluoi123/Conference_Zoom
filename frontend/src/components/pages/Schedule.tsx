"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Loader2, Calendar, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import * as z from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { scheduleApi } from "@/services/scheduleApi";
import { LoadingScreen } from "../ui/LoadingScreen";

const scheduleSchema = z.object({
  roomId: z.string().optional().or(z.literal("")),
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  time: z.string().min(1, "Vui lòng chọn giờ"),
  duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Thời lượng phải là số dương",
  }),
  description: z.string().optional(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

// Helper function to format date consistently
const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to format time consistently
const formatTimeForInput = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

function SchedulePage() {
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 3;
  const [currentPage, setCurrentPage] = useState(1);
  const [attendees, setAttendees] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [checkingRoom, setCheckingRoom] = useState(false);
  const [isRoomValid, setIsRoomValid] = useState<boolean | null>(null);

  // Schedule list states
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [searchText, setSearchText] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      duration: "60",
    },
  });

  const roomIdValue = watch("roomId");

  // Load schedules on mount
  useEffect(() => {
    setCurrentPage(1);
  }, [schedules])
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    if (!user?.id) return;
    setLoadingSchedules(true);
    try {
      const list = await scheduleApi.getListScheduleByHostId({
        userId: user.id,
      });

      // Load invited users from ROOM for each schedule
      const schedulesWithEmails = await Promise.all(
        list.map(async (schedule: any) => {
          try {
            // Get emails from ROOM, not from schedule
            const roomData = await scheduleApi.getInvitedUserInRoom({
              hostId: user.id,
              roomId: schedule.roomId,
            });
            return {
              ...schedule,
              emails: roomData.response.invited || [], // emails come from room
            };
          } catch {
            return {
              ...schedule,
              emails: [],
            };
          }
        })
      );

      setSchedules(schedulesWithEmails);
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải danh sách lịch họp");
    } finally {
      setLoadingSchedules(false);
    }
  };

  // ==================== CHECK ROOM ====================
  useEffect(() => {
    if (!roomIdValue) {
      setRoomError("");
      setIsRoomValid(null);
      return;
    }

    const timeout = setTimeout(() => {
      handleCheckRoom(roomIdValue);
    }, 500);

    return () => clearTimeout(timeout);
  }, [roomIdValue]);

  const handleCheckRoom = async (roomId: string) => {
    setRoomError("");
    setIsRoomValid(null);
    if (!roomId.trim() || !user) {
      setRoomError("");
      return;
    }
    try {
      setCheckingRoom(true);
      const res = await scheduleApi.getInvitedUserInRoom({
        hostId: user.id,
        roomId,
      });
      console.log(res);
      if (!res.success) {
        setRoomError("Phòng họp không tồn tại hoặc bạn không phải host");
        setIsRoomValid(false);
      } else {
        const list = res.response.invited || [];
        setAttendees((prev) => {
          const merged = [...prev];
          list.forEach((email: string) => {
            if (!merged.includes(email)) merged.push(email);
          });
          return merged;
        });
        setIsRoomValid(true);
      }
    } catch {
      setRoomError("Phòng họp không tồn tại hoặc bạn không phải host");
      setIsRoomValid(false);
    } finally {
      setCheckingRoom(false);
    }
  };

  // ==================== ADD EMAIL ====================
  const handleAddEmail = () => {
    setEmailError("");
    if (!emailInput.trim()) return;

    const emailSchema = z.string().email("Email không hợp lệ");
    const result = emailSchema.safeParse(emailInput.trim());

    if (!result.success) {
      setEmailError("Email không hợp lệ");
      return;
    }

    if (attendees.includes(emailInput.trim())) {
      setEmailError("Email đã tồn tại trong attendee");
      return;
    }

    setAttendees((prev) => [...prev, emailInput.trim()]);
    setEmailInput("");
  };

  const handleRemoveEmail = (email: string) => {
    setAttendees((prev) => prev.filter((x) => x !== email));
  };

  // ==================== SUBMIT STEP 1 ====================
  const onSubmitForm = (data: ScheduleFormValues) => {
    if (data.roomId && isRoomValid === false) {
      toast.error("Phòng họp không hợp lệ — vui lòng kiểm tra lại.");
      return;
    }

    setFormData(data);
    setIsConfirmOpen(true);
  };

  // ==================== FINAL CONFIRM ====================
  const handleFinalConfirm = async () => {
    if (!formData || !user) return;
    setIsSubmitting(true);

    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);

      if (editingSchedule) {
        // Update existing schedule
        await scheduleApi.updateSchedule({
          scheduleId: editingSchedule._id,
          title: formData.title,
          startTime,
          endTime: undefined,
          duration: formData.duration,
          emails: attendees,
        });
        toast.success("Cập nhật lịch họp thành công!");
      } else {
        // Create new schedule
        const scheData = await scheduleApi.createSchedule({
          hostId: user.id,
          roomId: formData.roomId || "",
          title: formData.title,
          startTime,
          duration: formData.duration,
          emails: attendees,
        });
        toast.success(
          `Tạo lịch họp thành công! RoomId: ${scheData.schedule.roomId}`
        );
      }

      reset();
      setAttendees([]);
      setEditingSchedule(null);
      setIsConfirmOpen(false);
      loadSchedules();
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== EDIT SCHEDULE ====================
  const handleEditSchedule = async (schedule: any) => {
    const startDateTime = new Date(schedule.startTime);

    // Use helper functions for consistent formatting
    const dateStr = formatDateForInput(startDateTime);
    const timeStr = formatTimeForInput(startDateTime);

    setEditingSchedule(schedule);
    setValue("roomId", schedule.roomId || "");
    setValue("title", schedule.title);
    setValue("date", dateStr);
    setValue("time", timeStr);
    setValue("duration", schedule.duration.toString());
    setValue("description", schedule.description || "");

    // Load fresh attendees data from room using getInvitedUserInRoom
    if (schedule.roomId && user?.id) {
      try {
        const roomData = await scheduleApi.getInvitedUserInRoom({
          hostId: user.id,
          roomId: schedule.roomId,
        });
        setAttendees(roomData.response.invited || []);
        setIsRoomValid(true);
        setRoomError("");
      } catch {
        setAttendees([]);
        setIsRoomValid(false);
        setRoomError("Không thể tải danh sách người tham gia");
      }
    } else {
      setAttendees([]);
      setIsRoomValid(null);
      setRoomError("");
    }
  };

  const handleCancelEdit = () => {
    setEditingSchedule(null);
    reset();
    setAttendees([]);
    setIsRoomValid(null);
    setRoomError("");
  };
  const totalPages = Math.ceil(schedules.length / ITEMS_PER_PAGE);
  const paginatedSchedules = schedules.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const [loadingPage, setLoadingPage] = useState(true);
  useEffect(() => {
    if (!user) {
      try {
        setLoadingPage(true);
      } catch (error) {
        console.error;
      } finally {
        setTimeout(() => {
          setLoadingPage(false);
        }, 500);
      }
    } else {
      setTimeout(() => {
        setLoadingPage(false);
      }, 500);
    }
  },[user])
  return (
    <>
      {loadingPage ? (
        <LoadingScreen />
      ) : (
        <MainLayout>
          <div className="max-w-7xl mx-auto p-6">
            <Link
              to="/home"
              className="text-blue-500 flex items-center gap-2 mb-6 hover:underline"
            >
              <ChevronLeft size={20} />
              Back to Home
            </Link>

            {/* TWO COLUMN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN - SCHEDULE LIST (Scrollable) */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar size={24} />
                        Lịch họp
                      </h2>
                      {loadingSchedules && (
                        <Loader2 className="animate-spin" size={20} />
                      )}
                    </div>

                    <div className="mb-3">
                      <Input
                        placeholder="Tìm lịch theo roomId hoặc tiêu đề..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>

                    <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2 space-y-3">
                      {schedules.length === 0 && !loadingSchedules && (
                        <p className="text-gray-500 text-center py-8 text-sm">
                          Chưa có lịch họp
                        </p>
                      )}

                      {paginatedSchedules
                        .filter((s) => {
                          if (!searchText.trim()) return true;
                          const text = searchText.toLowerCase();
                          return (
                            s?.title?.toLowerCase().includes(text) ||
                            s?.roomId?.toLowerCase().includes(text)
                          );
                        })
                        .map((schedule) => {
                          const startTime = new Date(schedule.startTime);
                          const dateStr = formatDateForInput(startTime);
                          const timeStr = formatTimeForInput(startTime);

                          return (
                            <div
                              key={schedule._id}
                              className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
                                editingSchedule?._id === schedule._id
                                  ? "ring-2 ring-blue-500 bg-blue-50"
                                  : ""
                              }`}
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              <h3 className="font-semibold text-sm mb-2">
                                {schedule.title}
                              </h3>
                              <div className="text-xs text-gray-600 space-y-1">
                                <p>
                                  📅 {dateStr} | ⏰ {timeStr}
                                </p>
                                <p>⏱️ {schedule.duration} phút</p>
                                {schedule.roomId && (
                                  <p className="font-mono text-xs truncate">
                                    🏠 {schedule.roomId}
                                  </p>
                                )}
                                {schedule.emails &&
                                  schedule.emails.length > 0 && (
                                    <p className="text-blue-600">
                                      👥 {schedule.emails.length} người
                                    </p>
                                  )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-3 mt-6">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <span className="text-sm text-slate-600 font-medium">
                          Trang {currentPage} / {totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="icon"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT COLUMN - FORM */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl font-bold">
                        {editingSchedule
                          ? "Chỉnh sửa lịch họp"
                          : "Tạo lịch họp mới"}
                      </h1>
                      {editingSchedule && (
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                        >
                          <X size={16} className="mr-2" />
                          Hủy
                        </Button>
                      )}
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmitForm)}
                      className="space-y-4"
                    >
                      {/* ROOM ID */}

                      {editingSchedule ? (
                        <div>
                          <label className="block mb-2 font-medium text-sm">
                            Room ID
                          </label>
                          <Input
                            {...register("roomId")}
                            placeholder="Để trống để tạo phòng mới"
                            disabled={!!editingSchedule}
                          />
                          {checkingRoom && (
                            <p className="text-blue-500 text-xs mt-1">
                              🔍 Đang kiểm tra phòng…
                            </p>
                          )}
                          {isRoomValid && (
                            <p className="text-green-500 text-xs mt-1">
                              ✔ Phòng hợp lệ — bạn là host
                            </p>
                          )}
                          {roomError && (
                            <p className="text-red-500 text-xs mt-1">
                              ❌ {roomError}
                            </p>
                          )}
                        </div>
                      ) : (
                        <></>
                      )}

                      {/* TITLE */}
                      <div>
                        <label className="block mb-2 font-medium text-sm">
                          Tiêu đề *
                        </label>
                        <Input
                          {...register("title")}
                          placeholder="Nhập tiêu đề cuộc họp"
                        />
                        {errors.title && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.title.message}
                          </p>
                        )}
                      </div>

                      {/* DATE + TIME */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-2 font-medium text-sm">
                            Ngày *
                          </label>
                          <Input type="date" {...register("date")} />
                          {errors.date && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.date.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-2 font-medium text-sm">
                            Giờ *
                          </label>
                          <Input type="time" {...register("time")} />
                          {errors.time && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.time.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* DURATION */}
                      <div>
                        <label className="block mb-2 font-medium text-sm">
                          Thời lượng (phút) *
                        </label>
                        <Input
                          type="number"
                          {...register("duration")}
                          placeholder="60"
                        />
                        {errors.duration && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.duration.message}
                          </p>
                        )}
                      </div>

                      {/* DESCRIPTION */}
                      <div>
                        <label className="block mb-2 font-medium text-sm">
                          Mô tả
                        </label>
                        <Textarea
                          {...register("description")}
                          placeholder="Mô tả cuộc họp"
                          rows={3}
                        />
                      </div>

                      {/* ATTENDEES */}
                      <div>
                        <label className="block mb-2 font-medium text-sm">
                          Mời người tham gia
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              (e.preventDefault(), handleAddEmail())
                            }
                            placeholder="Nhập email"
                          />
                          <Button
                            type="button"
                            onClick={handleAddEmail}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                        {emailError && (
                          <p className="text-red-500 text-xs mt-1">
                            {emailError}
                          </p>
                        )}
                        {attendees.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-3">
                            {attendees.map((email) => (
                              <div
                                key={email}
                                className="flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs"
                              >
                                <span>{email}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEmail(email)}
                                  className="font-bold hover:text-red-600"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* SUBMIT */}
                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          className="bg-blue-500 hover:bg-blue-600"
                          disabled={checkingRoom}
                        >
                          {editingSchedule
                            ? "Cập nhật lịch họp"
                            : "Tạo lịch họp"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* CONFIRM DIALOG */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSchedule
                      ? "Xác nhận cập nhật"
                      : "Xác nhận lịch họp"}
                  </DialogTitle>
                  <DialogDescription>
                    Vui lòng kiểm tra lại thông tin
                  </DialogDescription>
                </DialogHeader>

                {formData && (
                  <div className="p-4 space-y-2 text-sm bg-gray-50 rounded-lg">
                    <p>
                      <strong>Tiêu đề:</strong> {formData.title}
                    </p>
                    <p>
                      <strong>Ngày:</strong> {formData.date}
                    </p>
                    <p>
                      <strong>Giờ:</strong> {formData.time}
                    </p>
                    <p>
                      <strong>Thời lượng:</strong> {formData.duration} phút
                    </p>
                    {formData.roomId && (
                      <p>
                        <strong>Room ID:</strong> {formData.roomId}
                      </p>
                    )}
                    {attendees.length > 0 && (
                      <div>
                        <strong>Attendees:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {attendees.map((email) => (
                            <span
                              key={email}
                              className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs"
                            >
                              {email}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmOpen(false)}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleFinalConfirm} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </MainLayout>
      )}
    </>
  );
}

export default SchedulePage;

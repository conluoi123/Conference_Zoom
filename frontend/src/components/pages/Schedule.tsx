"use client";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/layout/MainLayout";
import { Textarea } from "../ui/textarea";
import { useAuth } from "@/context/AuthContext";
import {
  useMeeting,
} from "@videosdk.live/react-sdk";
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
import { meetingAPI } from "@/services/meetingApi";

// =============== SCHEMA ===============
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

function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [attendees, setAttendees] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { duration: "60" },
  });

  // =============== ADD EMAIL ===============
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

  // =============== REMOVE EMAIL ===============
  const handleRemoveEmail = (email: string) => {
    setAttendees((prev) => prev.filter((x) => x !== email));
  };

  // =============== SUBMIT FIRST TIME (OPEN CONFIRM DIALOG) ===============
  const onSubmitForm = (data: ScheduleFormValues) => {
    setFormData(data);
    setIsConfirmOpen(true);
  };

  // =============== FINAL CONFIRM (CALL API) ===============
  const handleFinalConfirm = async () => {
    if (!formData || !user) return;

    setIsSubmitting(true);
    try {
      const startTime = new Date(`${formData.date}T${formData.time}`);

      const scheData = await scheduleApi.createSchedule({
        hostId: user.id,
        title: formData.title,
        startTime,
        duration: formData.duration,
        emails: attendees, // gửi lên BE
      });
      
      // await meetingAPI.joinMeeting({roomId: scheData.schedule.roomId,peerId: user.id})

      toast.success("Tạo lịch họp thành công!");

      reset();
      setAttendees([]);
      setIsConfirmOpen(false);

      // navigate("/home");
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* HEADER */}
          <div className="space-y-4">
            <Link
              to="/home"
              className="flex items-center text-blue-600 text-sm font-medium hover:underline gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Schedule a Meeting</h1>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <Card>
              <CardContent className="p-8 space-y-6">
                {/* ROOM ID */}
                <div>
                  <label>Room ID</label>
                  <Input
                    {...register("roomId")}
                    placeholder="Có thể bỏ trống"
                  />
                </div>

                {/* TITLE */}
                <div>
                  <label>Title *</label>
                  <Input {...register("title")} />
                  {errors.title && (
                    <p className="text-red-500 text-xs">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* DATE & TIME */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label>Date *</label>
                    <Input type="date" {...register("date")} />
                  </div>
                  <div>
                    <label>Time *</label>
                    <Input type="time" {...register("time")} />
                  </div>
                </div>

                {/* DURATION */}
                <div>
                  <label>Duration (minutes)</label>
                  <Input type="number" {...register("duration")} />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label>Description</label>
                  <Textarea {...register("description")} />
                </div>

                {/* ATTENDEE INPUT */}
                <div>
                  <label>Attendees</label>

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
                    <Button type="button" onClick={handleAddEmail}>
                      <Plus />
                    </Button>
                  </div>

                  {emailError && (
                    <p className="text-red-500 text-xs">{emailError}</p>
                  )}

                  {/* LIST EMAIL TAGS */}
                  {attendees.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-2">
                      {attendees.map((email) => (
                        <div
                          key={email}
                          className="flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs"
                        >
                          <span>{email}</span>
                          <button
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
                <div className="flex justify-end">
                  <Button type="submit">Schedule Meeting</Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      {/* CONFIRM DIALOG */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận lịch họp</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra lại thông tin
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Hủy
            </Button>

            <Button onClick={handleFinalConfirm} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default SchedulePage;

"use client"
import React, { useState } from 'react';
import { ChevronLeft, Calendar, Clock, Users, Plus, Loader2 } from "lucide-react";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from "@/layout/MainLayout";
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/context/AuthContext';

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
import { zodResolver } from "@hookform/resolvers/zod"

// 1. Schema Validate
const scheduleSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải có ít nhất 5 ký tự"),
  date: z.string().min(1, "Vui lòng chọn ngày"),
  time: z.string().min(1, "Vui lòng chọn giờ"),
  duration: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Thời lượng phải là số dương",
  }),
  description: z.string().optional(),
  attendee: z.string().email("Email không hợp lệ").or(z.literal("")),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

function SchedulePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<ScheduleFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { duration: "60", attendee: "" },
  });

  // Xử lý khi nhấn nút Schedule Meeting lần đầu
  const onSubmitForm = (data: ScheduleFormValues) => {
    setFormData(data);
    setIsConfirmOpen(true);
  };

  // Xử lý xác nhận cuối cùng trong Modal
  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Giả lập gọi API tạo lịch hẹn
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Tạo lịch họp thành công!", {
        description: `Cuộc họp "${formData?.title}" đã được lên lịch.`,
      });

      setIsConfirmOpen(false);
      reset();
      navigate("/home"); // Thường sẽ quay về home sau khi tạo xong
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Link to="/home" className="flex items-center text-blue-600 text-sm font-medium hover:underline gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-slate-900">Schedule a Meeting</h1>
              <p className="text-slate-500">Create a new meeting and invite attendees</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardContent className="p-8 space-y-6">
                
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Meeting Title *</label>
                  <Input 
                    {...register("title")}
                    placeholder="e.g., Weekly Team Sync" 
                    className={`bg-slate-100/50 border-none h-12 focus-visible:ring-1 focus-visible:ring-blue-500 ${errors.title ? 'ring-1 ring-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>}
                </div>

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                      <Input 
                        type="date"
                        {...register("date")}
                        className="bg-slate-100/50 border-none h-12 pl-10 focus-visible:ring-1 focus-visible:ring-blue-500"
                      />
                    </div>
                    {errors.date && <p className="text-xs text-red-500 font-medium">{errors.date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                      <Input 
                        type="time"
                        {...register("time")}
                        className="bg-slate-100/50 border-none h-12 pl-10 focus-visible:ring-1 focus-visible:ring-blue-500"
                      />
                    </div>
                    {errors.time && <p className="text-xs text-red-500 font-medium">{errors.time.message}</p>}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Duration (minutes)</label>
                  <Input 
                    type="number"
                    {...register("duration")}
                    placeholder="60"
                    className="bg-white border-slate-200 h-12 focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                  {errors.duration && <p className="text-xs text-red-500 font-medium">{errors.duration.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <Textarea 
                    {...register("description")}
                    placeholder="Add meeting agenda, notes, or any other details..."
                    className="bg-slate-100/50 border-none min-h-[120px] focus-visible:ring-1 focus-visible:ring-blue-500 resize-none"
                  />
                </div>

                {/* Attendees */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Attendees</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Users className="absolute left-3 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
                      <Input 
                        {...register("attendee")}
                        placeholder="Enter email address"
                        className="bg-slate-100/50 border-none h-12 pl-10 focus-visible:ring-1 focus-visible:ring-blue-500"
                      />
                    </div>
                    <Button type="button" size="icon" variant="outline" className="h-12 w-12 border-slate-200">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  {errors.attendee && <p className="text-xs text-red-500 font-medium">{errors.attendee.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-4 flex justify-end">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 px-8 h-12 rounded-lg font-bold">
                    Schedule Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận lịch họp</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn lên lịch cuộc họp này không? Vui lòng kiểm tra lại thông tin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-semibold">Tiêu đề:</span>
              <span className="col-span-3">{formData?.title}</span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-semibold">Thời gian:</span>
              <span className="col-span-3">{formData?.date} lúc {formData?.time}</span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 min-w-[100px]" 
              onClick={handleFinalConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default SchedulePage;
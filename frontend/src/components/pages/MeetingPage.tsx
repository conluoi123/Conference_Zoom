import { Search, Filter, Plus, Video, Calendar, Clock, Users, MoreVertical } from "lucide-react";
import { MainLayout } from "@/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function MeetingsPage() {
  // Dữ liệu giả lập cho danh sách cuộc họp
  const upcomingMeetings = [
    {
      id: "123-456-789",
      title: "Weekly Team Sync",
      date: "Today, 3:00 PM",
      duration: "1 hour",
      attendees: 8,
      host: "You",
    },
    {
      id: "987-654-321",
      title: "Product Demo",
      date: "Tomorrow, 10:00 AM",
      duration: "45 min",
      attendees: 15,
      host: "Sarah Johnson",
    },
    {
      id: "456-789-123",
      title: "Client Presentation",
      date: "Nov 18, 2:00 PM",
      duration: "2 hours",
      attendees: 12,
      host: "You",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-slate-900">Meetings</h1>
              <p className="text-slate-500">Manage your upcoming and past meetings</p>
            </div>
            <Link to="/schedule">
              <Button className="bg-blue-600 hover:bg-blue-700 h-11 px-6 rounded-lg gap-2">
                <Plus className="w-5 h-5" />
                Schedule Meeting
              </Button>
            </Link>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search meetings..." 
                className="pl-10 h-11 bg-white border-slate-200 focus-visible:ring-blue-500"
              />
            </div>
            <Button variant="outline" className="h-11 px-4 gap-2 border-slate-200 text-slate-600">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          {/* Meetings List */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800">Upcoming Meetings</h2>
            
            <div className="grid gap-4">
              {upcomingMeetings.map((meeting) => (
                <Card key={meeting.id} className="border-none shadow-sm ring-1 ring-slate-200 hover:ring-blue-200 transition-all">
                  <CardContent className="p-5 flex items-center gap-5">
                    
                    {/* Icon Square */}
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Video className="w-7 h-7 text-blue-600" />
                    </div>

                    {/* Meeting Info */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold text-slate-900">{meeting.title}</h3>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {meeting.date}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {meeting.duration}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {meeting.attendees} attendees
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">
                          Host: {meeting.host}
                        </span>
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-semibold">
                          ID: {meeting.id}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button className="bg-blue-600 hover:bg-blue-700 px-6 font-bold h-10 rounded-lg">
                        Join
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
import { createContext, useContext, useState } from "react";

export type MeetingStatus = "upcoming" | "live" | "ended";

export type StatusMeetings = {
  scheduleId: string;
  sessionId?: string;
  status: MeetingStatus;
};

type UpcomingMeeting = {
  meetingsStatus: Record<string, StatusMeetings>;
  updateMeeting: (m: StatusMeetings) => void;
};

const MeetingStatusContext = createContext<UpcomingMeeting | null>(null);

export const UpcomingMeetingStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [meetingsStatus, setMeetings] = useState<Record<string, StatusMeetings>>({});

  const updateMeeting = (m: StatusMeetings) => {
    setMeetings((prev) => ({
      ...prev,
      [m.scheduleId]: {
        ...prev[m.scheduleId],
        ...m,
      },
    }));
  };

  return (
    <MeetingStatusContext.Provider value={{ meetingsStatus, updateMeeting }}>
      {children}
    </MeetingStatusContext.Provider>
  );
};

export const useMeetingStatus = () => {
  const context = useContext(MeetingStatusContext);
  if (!context) throw new Error("Loi");
  return context;
};

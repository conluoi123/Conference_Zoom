// SubtitleBar.tsx
interface SubtitleBarProps {
  subtitles: {
    id: string;
    participantId: string;
    participantName: string;
    text: string;
  }[];
}

export const SubtitleBar = ({ subtitles }: SubtitleBarProps) => {
  if (subtitles.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-4xl flex flex-col gap-2 items-center">
      {subtitles.map((subtitle) => (
        <div
          key={subtitle.id}
          className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-6 py-2 shadow-2xl w-full"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-blue-400 font-semibold shrink-0">
              {subtitle.participantName}:
            </span>
            <p className="text-base text-white leading-tight">
              {subtitle.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
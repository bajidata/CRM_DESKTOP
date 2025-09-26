import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";

interface StatusCardProps {
  color: string
  isRequesting: boolean; // true = fetching, false = no request
  title?: string; // optional custom title while loading
  flashDuration?: number; // how long to show "Completed in" (ms)
}

export default function StatusCard({
  color,
  isRequesting,
  title = "Fetching result",
  flashDuration = 6000,
}: StatusCardProps) {
  const [elapsed, setElapsed] = useState(0);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRequesting) {
      setElapsed(0);
      setShowCompleted(false);
      interval = setInterval(() => setElapsed((prev) => prev + 100), 100);
    } else if (elapsed > 0) {
      // request finished, show completed message
      setShowCompleted(true);
      const timeout = setTimeout(() => setShowCompleted(false), flashDuration);
      return () => clearTimeout(timeout);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRequesting]);

  // Hide component completely if not requesting and completed flash done
  if (!isRequesting && !showCompleted) return null;

  const formattedTime = `${(elapsed / 1000).toFixed(1)}s`;

  // Choose icon based on state
  const icon = isRequesting ? (
    <div className={`loader-scrapper ${color}`} />
  ) : (
    <CheckCircle className={`w-6 h-6 ${color}`} />
  );

  return (
    <div className="w-fit rounded-md flex items-center gap-2">
      {icon}
      <h1 className={`text-sm uppercase ${color}`}>
        {isRequesting ? title : "Fetching Completed in"}{" "}
        <span className={`font-semibold ${color} lowercase`}>{formattedTime}</span>
      </h1>
    </div>
  );
}

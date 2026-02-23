export const formatDate = (dateString: string) => {
  if (!dateString) return "No date available";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTimeToReadable = (iso: string) => {
  if (!iso) return "No date available";

  const date = new Date(iso);

  const parts = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find(p => p.type === type)?.value ?? "";

  return `${get("weekday")}, ${get("month")} ${get("day")} at ${get("hour")}:${get("minute")} ${get("dayPeriod")}`;
};


export const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

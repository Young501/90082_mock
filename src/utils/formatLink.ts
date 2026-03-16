export function getLinkDisplayText(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return (
      parsed.hostname.replace(/^www\./, "") +
        parsed.pathname.replace(/\/$/, "") || url
    );
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
}

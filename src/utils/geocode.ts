import { GeocodeResult } from "@/types/shared";

/** Normalizes v2 geocode search API response for form state and profile payloads. */
export function mapGeocodeSearchResponse(
  raw: Record<string, unknown>
): GeocodeResult {
  return {
    id: 0,
    ...raw,
    formatted_address: String(raw.formatted_address ?? ""),
  } as GeocodeResult;
}

/** Renders organisation/user location whether API returns a string or object with formatted_address property. */
/*** presently API returns a string */
export function formatLocationDisplay(location: unknown): string {
  if (location == null) return "";
  if (typeof location === "string") return location;
  if (
    typeof location === "object" &&
    location !== null &&
    "formatted_address" in location
  ) {
    return String(
      (location as { formatted_address?: string }).formatted_address ?? ""
    );
  }
  return "";
}

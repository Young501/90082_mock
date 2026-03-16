/**
 * Builds the list of page numbers and ellipses to show in the pagination bar.
 * Keeps the UI compact by showing a sliding window of 3 pages around the current page,
 * plus first and last page with "..." when there are gaps.
 */
export function getPaginationVisiblePages(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];
  const windowSize = 3;

  const windowStart = Math.max(1, currentPage - 1);
  const windowEnd = Math.min(totalPages, windowStart + windowSize - 1);

  // If window doesn’t start at 1, show first page (and ellipsis only when there’s a gap)
  if (windowStart > 1) {
    pages.push(1);
    if (windowStart > 2) pages.push("ellipsis");
  }

  // Add the visible page numbers in the window
  for (let p = windowStart; p <= windowEnd; p++) {
    pages.push(p);
  }

  // If window doesn’t reach the last page, show last page (and ellipsis only when there’s a gap)
  if (windowEnd < totalPages) {
    if (windowEnd < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);
  }

  return pages;
}

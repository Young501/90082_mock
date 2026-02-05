import React from "react";

const IconSidebarLine = ({
  segmentCount = 1,
  color = "#E4E4E7",
  rowHeight = 48,
  gap = 4,
}: {
  segmentCount?: number;
  color?: string;
  rowHeight?: number;
  gap?: number;
}) => {
  if (segmentCount < 1) return null;

  const topMargin = 4;
  const viewHeight =
    topMargin + segmentCount * rowHeight + (segmentCount - 1) * gap;

  const segments: React.ReactNode[] = [];

  for (let i = 0; i < segmentCount; i++) {
    const branchY =
      topMargin + i * (rowHeight + gap) + Math.floor(rowHeight / 2);

    if (i === 0) {
      // vertical from top to first branch + horizontal
      segments.push(
        <rect key="v0" x={1} y={0} width={2} height={branchY} fill={color} />
      );
      segments.push(
        <rect
          key="h0"
          x={1}
          y={branchY - 1}
          width={12}
          height={2}
          fill={color}
        />
      );
    } else {
      const prevBranchY =
        topMargin + (i - 1) * (rowHeight + gap) + Math.floor(rowHeight / 2);
      segments.push(
        <rect
          key={`v${i}`}
          x={1}
          y={prevBranchY}
          width={2}
          height={branchY - prevBranchY}
          fill={color}
        />
      );
      segments.push(
        <rect
          key={`h${i}`}
          x={1}
          y={branchY - 1}
          width={12}
          height={2}
          fill={color}
        />
      );
    }
  }

  return (
    <svg
      width="13"
      height={viewHeight}
      viewBox={`0 0 13 ${viewHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{ width: 13, height: "100%", minHeight: viewHeight }}
    >
      {segments}
    </svg>
  );
};

export default IconSidebarLine;

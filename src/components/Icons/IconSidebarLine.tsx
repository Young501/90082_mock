import React from "react";

const IconSidebarLine = ({ color = "#E4E4E7" }: { color?: string }) => {
  return (
    <svg
      width="13"
      height="40"
      viewBox="0 0 13 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 0V40M2 20H12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default IconSidebarLine;

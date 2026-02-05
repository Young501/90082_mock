import React from "react";

const IconFilter = ({ color = "#3F3F46" }: { color?: string }) => {
  return (
    <svg
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1H16M4.33333 6H12.6667M6.83333 11H10.1667"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconFilter;

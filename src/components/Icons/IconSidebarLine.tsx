import React from "react";

const IconSidebarLine = ({ color = "#E4E4E7" }: { color?: string }) => {
  return (
    <svg
      width="13"
      height="23"
      viewBox="0 0 13 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 21C12.5523 21 13 21.4477 13 22C13 22.5523 12.5523 23 12 23L12 22L12 21ZM6 22L6 21L12 21L12 22L12 23L6 23L6 22ZM1 -1.90735e-06L2 -1.70942e-06L2 17L1 17L2.80506e-07 17L1.23423e-06 -2.10527e-06L1 -1.90735e-06ZM6 22L6 23C2.68629 23 9.46031e-08 20.3137 2.80506e-07 17L1 17L2 17C2 19.2091 3.79086 21 6 21L6 22Z"
        fill={color}
      />
    </svg>
  );
};

export default IconSidebarLine;

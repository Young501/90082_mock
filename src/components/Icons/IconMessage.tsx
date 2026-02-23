import React from "react";

const IconMessage = ({ color = "#71717A" }: { color?: string }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.58464 16.6669C8.17512 17.4827 10.0047 17.7037 11.7437 17.29C13.4827 16.8763 15.0168 15.8551 16.0694 14.4104C17.1221 12.9656 17.6242 11.1925 17.4851 9.41034C17.3461 7.62821 16.5751 5.95434 15.3111 4.69036C14.0472 3.42638 12.3733 2.65541 10.5912 2.51638C8.80904 2.37735 7.03586 2.87941 5.59115 3.93207C4.14644 4.98474 3.12521 6.51879 2.71149 8.2578C2.29776 9.9968 2.51875 11.8264 3.33464 13.4169L1.66797 18.3335L6.58464 16.6669Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconMessage;

import React from "react";

const IconCheck = ({ color = "#1679AB" }: { color?: string }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1193_27833)">
        <path
          d="M18.3346 9.23355V10.0002C18.3336 11.7972 17.7517 13.5458 16.6757 14.9851C15.5998 16.4244 14.0874 17.4773 12.3641 17.9868C10.6408 18.4963 8.79902 18.4351 7.11336 17.8124C5.4277 17.1896 3.98851 16.0386 3.01044 14.5311C2.03236 13.0236 1.56779 11.2403 1.68603 9.44714C1.80427 7.65402 2.49897 5.94715 3.66654 4.58111C4.8341 3.21506 6.41196 2.26303 8.16479 1.867C9.91763 1.47097 11.7515 1.65216 13.393 2.38355M7.50131 9.16688L10.0013 11.6669L18.3346 3.33355"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1193_27833">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default IconCheck;

import React from "react";

const IconOpportunity = ({ color = "#FFFFFF" }: { color?: string }) => {
  return (
    <svg
      width="19"
      height="17"
      viewBox="0 0 19 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.4167 15.75V2.41667C12.4167 1.97464 12.2411 1.55072 11.9285 1.23816C11.616 0.925595 11.192 0.75 10.75 0.75H7.41667C6.97464 0.75 6.55072 0.925595 6.23816 1.23816C5.92559 1.55072 5.75 1.97464 5.75 2.41667V15.75M2.41667 4.08333H15.75C16.6705 4.08333 17.4167 4.82953 17.4167 5.75V14.0833C17.4167 15.0038 16.6705 15.75 15.75 15.75H2.41667C1.49619 15.75 0.75 15.0038 0.75 14.0833V5.75C0.75 4.82953 1.49619 4.08333 2.41667 4.08333Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconOpportunity;

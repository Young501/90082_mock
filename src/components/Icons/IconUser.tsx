import React from "react";

const IconUser = ({ color = "#71717A" }: { color?: string }) => {
  return (
    <svg
      width="14"
      height="17"
      viewBox="0 0 14 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.4167 15.75V14.0833C12.4167 13.1993 12.0655 12.3514 11.4404 11.7263C10.8152 11.1012 9.96739 10.75 9.08333 10.75H4.08333C3.19928 10.75 2.35143 11.1012 1.72631 11.7263C1.10119 12.3514 0.75 13.1993 0.75 14.0833V15.75M9.91667 4.08333C9.91667 5.92428 8.42428 7.41667 6.58333 7.41667C4.74238 7.41667 3.25 5.92428 3.25 4.08333C3.25 2.24238 4.74238 0.75 6.58333 0.75C8.42428 0.75 9.91667 2.24238 9.91667 4.08333Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconUser;

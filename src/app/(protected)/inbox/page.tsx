"use client";

import React from "react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";

const Inbox = () => {
  return (
    <>
    <PageTitle title={PAGE_TITLES.INBOX} />
    <div>Inbox</div>
    </>
  );
};

export default Inbox;

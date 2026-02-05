"use client";

import React from "react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { MessageCircleX } from "lucide-react";

const Inbox = () => {
  return (
    <>
      <PageTitle title={PAGE_TITLES.MESSAGING} />
      <div>Inbox</div>
    </>
  );
};

export default Inbox;

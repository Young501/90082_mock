"use client";

import React from "react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import privacyContent from "@/../public/documents/markdowns/privacy.md?raw";

const PrivacyPage = () => {
  return (
    <>
      <PageTitle title={PAGE_TITLES.PRIVACY} />
      <MarkdownRenderer
        content={privacyContent}
        title="Privacy Policy"
        lastUpdated="August 26, 2025"
        version="1.0"
      />
    </>
  );
};

export default PrivacyPage;

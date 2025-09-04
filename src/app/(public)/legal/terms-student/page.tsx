"use client";

import React from "react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import studentTermsContent from "@/../public/documents/markdowns/studentTerms.md?raw";

const TermsStudentPage = () => {
  return (
    <>
      <PageTitle title={PAGE_TITLES.TERMS_STUDENT} />
      <MarkdownRenderer
        content={studentTermsContent}
        title="Student Terms & Conditions"
        lastUpdated="August 2024"
        version="1.0"
      />
    </>
  );
};

export default TermsStudentPage;

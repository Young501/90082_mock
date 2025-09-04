"use client";

import React from "react";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import partnerTermsContent from "@/../public/documents/markdowns/partnerTerms.md?raw";

const TermsOrganisationPage = () => {
  return (
    <>
      <PageTitle title={PAGE_TITLES.TERMS_ORGANISATION} />
      <MarkdownRenderer
        content={partnerTermsContent}
        title="Organisation Terms & Conditions"
        lastUpdated="August 2024"
        version="1.0"
      />
    </>
  );
};

export default TermsOrganisationPage;

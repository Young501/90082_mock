import type { AccessibleOpportunity, Opportunity } from "@/types/opportunities";

export function findOpportunityByIdOrSlug(
  opportunities: AccessibleOpportunity[] | null | undefined,
  identifier: string | null | undefined
): AccessibleOpportunity | undefined {
  if (!opportunities || !identifier) {
    return undefined;
  }

  return opportunities.find(
    (opp) => opp.id.toString() === identifier || opp.slug === identifier
  );
}

/** Narrow an accessible opportunity to the base `Opportunity`.
 **/
export function toBaseOpportunity(
  current: AccessibleOpportunity | null | undefined
): Opportunity | null {
  if (!current) return null;
  return {
    id: current.id,
    title: current.title,
    description: current.description ?? "",
    logo_url: current.logo_url,
    start_date: current.start_date ?? "",
    end_date: current.end_date ?? "",
    created_by: current.created_by ?? 0,
    is_active: current.is_active ?? true,
    created_at: current.created_at ?? "",
    updated_at: current.updated_at ?? "",
    questionnaire: current.questionnaire ?? {},
    allowed_student_email_domains: current.allowed_student_email_domains,
    is_default: current.is_default,
    links: current.links,
    enrollment_preview: current.enrollment_preview,
  };
}

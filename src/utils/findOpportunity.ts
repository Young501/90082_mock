import { AccessibleOpportunity } from "@/types/opportunities";

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

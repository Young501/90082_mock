import { StudentProfile, OrganisationProfile } from "./discovery";


export type FilterKind = "scalar" | "array" | "boolean" | "range";

export interface FacetOption {
  value: string;
  count: number;
}

export interface FacetField {
  label: string;
  key: string;
  kind: FilterKind;
  options: FacetOption[];
}

export interface FacetsResponse {
  facets: {
    onboarding: Record<string, FacetField>;
    questionnaire: Record<string, FacetField>;
  };
}

export interface ArrayFilterValue {
  values: string[];
  mode: "and" | "or";
}

export type FilterValue = string[] | ArrayFilterValue | boolean | number;

export type OpportunityFilters = Record<string, FilterValue | undefined> & {
  questionnaire?: Record<string, FilterValue | undefined>;
};

export interface OpportunityRequestBody {
  participant_type: string;
  query?: string;
  sort?: string;
  filters?: OpportunityFilters;
}

export interface SearchResponse {
  results: (StudentProfile | OrganisationProfile)[];
  page: {
    count: number;
    next: string | null;
    previous: string | null;
  }
}

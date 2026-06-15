import { useMemo } from "react";
import {
  useUserMeV2,
  useStudentProfileV2,
  useOrganisationMemberMeV2,
} from "@/services/shared";

type PrefillData = Record<string, any>;

const EXCLUDED_KEYS = new Set(["location", "university"]);

const isExcludedKey = (key: string): boolean =>
  EXCLUDED_KEYS.has(key) || key.endsWith("_url");


const normalizeValue = (value: any): any => {
  if (value == null) return undefined;
  if (value instanceof File) return undefined;

  if (Array.isArray(value)) {
    const items = value
      .map((v) =>
        v && typeof v === "object" ? (v.value ?? v.code ?? v.id) : v
      )
      .filter((v) => v != null && v !== "");
    return items.length > 0 ? items : undefined;
  }

  if (typeof value === "object") {
    return value.value ?? value.code ?? value.id ?? undefined;
  }

  if (typeof value === "string") {
    return value.trim() === "" ? undefined : value;
  }

  return value;
};

/** Build prefill from prodile **/
const buildPrefill = (source: PrefillData | undefined | null): PrefillData => {
  if (!source) return {};
  const prefill: PrefillData = {};
  Object.entries(source).forEach(([key, raw]) => {
    if (isExcludedKey(key)) return;
    const normalized = normalizeValue(raw);
    if (normalized !== undefined) {
      prefill[key] = normalized;
    }
  });
  return prefill;
};

/** Pick set of fields from a profile object */
const pickFields = (
  source: PrefillData | undefined | null,
  fields: readonly string[]
): PrefillData => {
  if (!source) return {};
  const prefill: PrefillData = {};
  fields.forEach((field) => {
    const normalized = normalizeValue(source[field]);
    if (normalized !== undefined) {
      prefill[field] = normalized;
    }
  });
  return prefill;
};

interface UsePrefillDataResult {
  prefillData: PrefillData | null;
  isLoading: boolean;
}


export const usePrefillData = (userType: string): UsePrefillDataResult => {
  const isStudent = userType === "student";
  const isOrganisation = userType === "organisation";
  const isCoordinator = userType === "coordinator";

  const { data: userMe, isLoading: isUserMeLoading } = useUserMeV2(
    isStudent || isCoordinator
  );
  const { data: studentProfile, isLoading: isStudentLoading } =
    useStudentProfileV2(isStudent);
  const {
    data: organisationMember,
    isLoading: isMemberLoading,
    isFetched: isMemberFetched,
  } = useOrganisationMemberMeV2(isOrganisation);

  const isLoading =
    (isStudent && (isUserMeLoading || isStudentLoading)) ||
    (isOrganisation && (isMemberLoading || !isMemberFetched)) ||
    (isCoordinator && isUserMeLoading);

  const prefillData = useMemo<PrefillData | null>(() => {
    if (isLoading) return null;

    if (isStudent) {
      return buildPrefill({ ...studentProfile, ...userMe });
    }

    if (isOrganisation) {
      // 404 (no org member yet) resolves to undefined, empty prefill.
      return pickFields(organisationMember, [
        "first_name",
        "last_name",
        "job_title",
      ]);
    }

    if (isCoordinator) {
      return pickFields(userMe, ["first_name", "last_name"]);
    }

    return {};
  }, [
    isLoading,
    isStudent,
    isOrganisation,
    isCoordinator,
    userMe,
    studentProfile,
    organisationMember,
  ]);

  return { prefillData, isLoading };
};

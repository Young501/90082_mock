import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthStore } from "@/store";
import {
  FilterFormData,
  ProcessedField,
  DependencyCondition,
  UserSearchParams,
  UserProfile,
} from "@/types/discovery";
import { useUserSearch } from "@/services/user";
import {
  useOnboardingPages,
  useAcceptedOpportunities,
} from "@/services/shared";
import { toast } from "react-toastify";

const createValidationSchema = (fields: ProcessedField[]) => {
  const shape: Record<string, any> = {};

  fields.forEach((field) => {
    if (
      field.type === "multi-select" ||
      field.type === "tag-select" ||
      field.type === "checkbox-group"
    ) {
      shape[field.field] = yup.array().of(yup.string()).optional();
    } else {
      shape[field.field] = yup.string().optional();
    }
  });

  return yup.object().shape(shape);
};

const getDefaultValues = (fields: ProcessedField[]): FilterFormData => {
  const defaultValues: FilterFormData = {};
  fields.forEach((field) => {
    if (
      field.type === "multi-select" ||
      field.type === "tag-select" ||
      field.type === "checkbox-group"
    ) {
      defaultValues[field.field] = [];
    } else {
      defaultValues[field.field] = "";
    }
  });
  return defaultValues;
};

const extractFilterOptions = (
  results: UserProfile[]
): Record<string, string[]> => {
  const options: Record<string, Set<string>> = {};

  results.forEach((user) => {
    Object.keys(user).forEach((fieldKey) => {
      if (!options[fieldKey]) {
        options[fieldKey] = new Set();
      }

      const value = (user as any)[fieldKey];

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v && typeof v === "string") {
            options[fieldKey].add(v);
          }
        });
      } else if (value && typeof value === "string") {
        options[fieldKey].add(value);
      }
    });
  });

  return Object.fromEntries(
    Object.entries(options).map(([key, set]) => [key, Array.from(set).sort()])
  );
};

// ===== Main Hook =====
export const useDiscovery = () => {
  const { user } = useAuthStore();
  const [filterableFields, setFilterableFields] = useState<ProcessedField[]>(
    []
  );
  const [searchParams, setSearchParams] = useState<UserSearchParams | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>(
    {}
  );

  const userType = user?.user_types?.[0];
  const targetUserType = useMemo(() => {
    if (!userType) return null;
    return userType === "student" ? "partner" : "student";
  }, [userType]);

  const { data: acceptedOpportunities, isLoading: isOpportunitiesLoading } =
    useAcceptedOpportunities();
  const currentOpportunityId = acceptedOpportunities?.[0]?.id;

  const { data: onboardingData, isLoading: isOnboardingLoading } =
    useOnboardingPages(targetUserType || "");

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
    isFetching,
  } = useUserSearch(searchParams);

  const validationSchema = useMemo(
    () => createValidationSchema(filterableFields),
    [filterableFields]
  );

  const form = useForm<FilterFormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: getDefaultValues(filterableFields),
  });

  useEffect(() => {
    if (searchData?.results) {
      const newFilterOptions = extractFilterOptions(searchData.results);
      setFilterOptions(newFilterOptions);
    }
  }, [searchData?.results]);

  useEffect(() => {
    if (filterableFields.length > 0) {
      const defaultValues = getDefaultValues(filterableFields);
      form.reset(defaultValues);
    }
  }, [filterableFields, form]);

  useEffect(() => {
    if (
      targetUserType &&
      !searchParams &&
      !isOpportunitiesLoading &&
      currentOpportunityId
    ) {
      setSearchParams({
        user_type: targetUserType,
        opportunity_id: currentOpportunityId,
        page: currentPage,
        page_size: pageSize,
      });
    }
  }, [
    targetUserType,
    searchParams,
    currentPage,
    pageSize,
    currentOpportunityId,
    isOpportunitiesLoading,
  ]);

  useEffect(() => {
    if (
      !isOpportunitiesLoading &&
      acceptedOpportunities !== undefined &&
      !currentOpportunityId
    ) {
      toast.warning(
        "You haven't joined any opportunities yet. Please accept an opportunity invitation to search for users."
      );
    }
  }, [isOpportunitiesLoading, acceptedOpportunities, currentOpportunityId]);

  const processFollowupQuestions = useCallback(
    (
      field: any,
      parentDependencies: DependencyCondition[] = [],
      processedFields: Map<string, ProcessedField> = new Map()
    ): void => {
      if (field.is_filter !== true) return;

      const uniqueKey =
        parentDependencies.length === 0
          ? field.field
          : `${parentDependencies.map((d) => `${d.field}=${d.value}`).join("_")}_${field.field}`;

      if (processedFields.has(uniqueKey)) return;

      const displayHint =
        parentDependencies.length > 0
          ? `(when ${parentDependencies.map((d) => `${d.field} = ${d.value}`).join(" and ")})`
          : undefined;

      const processedField: ProcessedField = {
        ...field,
        uniqueKey,
        dependencyChain: [...parentDependencies],
        displayHint,
      };

      processedFields.set(uniqueKey, processedField);

      if (
        field.followup_question &&
        typeof field.followup_question === "object"
      ) {
        Object.entries(field.followup_question).forEach(
          ([triggerValue, followupField]: [string, any]) => {
            if (followupField && typeof followupField === "object") {
              const newDependency: DependencyCondition = {
                field: field.field,
                value: triggerValue,
                operator: "equals",
              };

              processFollowupQuestions(
                followupField,
                [...parentDependencies, newDependency],
                processedFields
              );
            }
          }
        );
      }
    },
    []
  );

  const checkDependencies = (
    field: ProcessedField,
    formValues: FilterFormData
  ): boolean => {
    if (field.dependencyChain.length === 0) return true;

    return field.dependencyChain.every((dependency) => {
      const currentValue = formValues[dependency.field];

      switch (dependency.operator || "equals") {
        case "equals":
          if (Array.isArray(currentValue)) {
            return currentValue.includes(dependency.value);
          }
          return currentValue === dependency.value;
        case "contains":
          return (
            Array.isArray(currentValue) &&
            currentValue.includes(dependency.value)
          );
        case "not_equals":
          if (Array.isArray(currentValue)) {
            return !currentValue.includes(dependency.value);
          }
          return currentValue !== dependency.value;
        default:
          if (Array.isArray(currentValue)) {
            return currentValue.includes(dependency.value);
          }
          return currentValue === dependency.value;
      }
    });
  };

  const handleSearch = (data: FilterFormData) => {
    if (!targetUserType || !currentOpportunityId) return;

    const filteredEntries = Object.entries(data).filter(
      ([_, value]) =>
        value && value !== "" && !(Array.isArray(value) && value.length === 0)
    );

    const newSearchParams: UserSearchParams = {
      user_type: targetUserType,
      opportunity_id: currentOpportunityId,
      page: 1,
      page_size: pageSize,
      ...Object.fromEntries(filteredEntries),
    };

    setCurrentPage(1);
    setSearchParams(newSearchParams);
  };

  const handleReset = () => {
    form.reset();
    setCurrentPage(1);

    if (targetUserType && currentOpportunityId) {
      setSearchParams({
        user_type: targetUserType,
        opportunity_id: currentOpportunityId,
        page: 1,
        page_size: pageSize,
      });
    }
  };

  const handlePageChange = (page: number) => {
    if (!searchParams) return;

    setCurrentPage(page);
    setSearchParams({
      ...searchParams,
      page,
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    if (!searchParams) return;

    setPageSize(newPageSize);
    setCurrentPage(1);
    setSearchParams({
      ...searchParams,
      page: 1,
      page_size: newPageSize,
    });
  };

  useEffect(() => {
    if (!onboardingData || !targetUserType) return;

    const processedFields = new Map<string, ProcessedField>();
    const typedData = onboardingData as { onboarding_pages: any[] };

    if (
      typedData.onboarding_pages &&
      Array.isArray(typedData.onboarding_pages)
    ) {
      typedData.onboarding_pages.forEach((page: any) => {
        if (page.questions && Array.isArray(page.questions)) {
          page.questions.forEach((field: any) => {
            processFollowupQuestions(field, [], processedFields);
          });
        }
      });
    }

    setFilterableFields(Array.from(processedFields.values()));
  }, [onboardingData, processFollowupQuestions, targetUserType]);

  const hasSearchFilters = useMemo(() => {
    if (!searchParams) return false;
    const { user_type, opportunity_id, page, page_size, ...filters } =
      searchParams;
    return Object.keys(filters).length > 0;
  }, [searchParams]);

  const totalPages = useMemo(() => {
    if (!searchData?.count) return 1;
    return Math.ceil(searchData.count / pageSize);
  }, [searchData?.count, pageSize]);

  return {
    searchResults: searchData?.results || [],
    hasSearched: hasSearchFilters,
    filterableFields,
    filterOptions,
    targetUserType,
    isLoading: isOnboardingLoading || isSearchLoading,
    isSearching: isFetching,
    form,
    handleSearch: form.handleSubmit(
      (data) => {
        handleSearch(data);
      },
      (errors) => {
        console.log(errors);
      }
    ),
    handleReset,
    checkDependencies,
    resultsCount: searchData?.count || 0,
    showResults: !!searchData?.results,
    searchParams,
    searchError,
    currentPage,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  };
};

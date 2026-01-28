import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthStore } from "@/store";
import {
  FilterFormData,
  ProcessedField,
  DependencyCondition,
  UserSearchParams,
} from "@/types/discovery";
import { useUserSearch } from "@/services/user";
import { useOnboardingPages, useQuestionnaireFilters } from "@/services/shared";
import { toast } from "react-toastify";
import { UserProfile } from "@/types/shared";
import { parseQuestionnaireOptions } from "@/utils/questionnaireParser";

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
  results: UserProfile[],
  fields: ProcessedField[],
  currentValues?: FilterFormData
): Record<string, Array<{ label: string; value: string; count: number }>> => {
  const options: Record<string, Map<string, number>> = {};

  // Initialize with currently selected values to ensure they are always visible
  if (currentValues) {
    fields.forEach((field) => {
      options[field.field] = new Map();
      const selectedValues = currentValues[field.field];
      if (Array.isArray(selectedValues)) {
        selectedValues.forEach((v) => {
          if (v && typeof v === "string") {
            options[field.field].set(v, 0);
          }
        });
      } else if (selectedValues && typeof selectedValues === "string") {
        options[field.field].set(selectedValues, 0);
      }
    });
  }

  results.forEach((user) => {
    fields.forEach((field) => {
      if (!options[field.field]) {
        options[field.field] = new Map();
      }

      let value;
      if (field.source === "questionnaire") {
        value = (user as any).questionnaire_answers?.[field.field];
      } else {
        value = (user as any)[field.field];
      }

      const processValue = (v: any) => {
        if (v && typeof v === "string") {
          options[field.field].set(v, (options[field.field].get(v) || 0) + 1);
        }
      };

      if (Array.isArray(value)) {
        value.forEach(processValue);
      } else {
        processValue(value);
      }
    });
  });

  return Object.fromEntries(
    Object.entries(options).map(([fieldName, valueMap]) => {
      const field = fields.find((f) => f.field === fieldName);
      
      const predefinedOptions = field?.options ? parseQuestionnaireOptions(field.options) : [];
      const optionMap = new Map(predefinedOptions.map((opt) => [opt.value, opt]));

      const sortedEntries = Array.from(valueMap.entries()).sort((a, b) => {
        // Sort by count descending, then by label
        if (b[1] !== a[1]) return b[1] - a[1];
        const labelA = optionMap.get(a[0])?.label || a[0];
        const labelB = optionMap.get(b[0])?.label || b[0];
        return labelA.localeCompare(labelB);
      });

      const mappedOptions = sortedEntries.map(([val, count]) => {
        const opt = optionMap.get(val);
        return {
          label: opt?.label || val,
          value: val,
          count,
        };
      });

      return [fieldName, mappedOptions];
    })
  );
};

type UseDiscoveryOpts = {
  isEnrolled?: boolean; // tri-state: undefined while unknown
  isEnrollmentReady?: boolean; // when you've finished computing isEnrolled
};

// ===== Main Hook =====
export const useDiscovery = (
  opportunityIdOverride?: string,
  opts: UseDiscoveryOpts = {}
) => {
  const { isEnrolled, isEnrollmentReady } = opts;

  const { user } = useAuthStore();
  const [filterableFields, setFilterableFields] = useState<ProcessedField[]>(
    []
  );
  const [searchParams, setSearchParams] = useState<UserSearchParams | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterOptions, setFilterOptions] = useState<
    Record<string, Array<{ label: string; value: string; count: number }>>
  >({});
  const [isSearching, setIsSearching] = useState(false);
  const previousSearchParamsRef = useRef<string | null>(null);
  const autoSelectedFieldsRef = useRef<Record<string, string>>({});

  const userType = user?.user_types?.[0];
  const targetUserType = useMemo(() => {
    if (!userType) return null;
    return userType === "student" ? "organisation" : "student";
  }, [userType]);

  const currentOpportunityId = opportunityIdOverride;

  const { data, isLoading: isOnboardingLoading } = useOnboardingPages(
    targetUserType || ""
  );

  const userOnboardingData = data?.onboarding_pages?.user;
  const organisationOnboardingData = data?.onboarding_pages?.organisation;
  const onboardingData =
    userType === "student" ? organisationOnboardingData : userOnboardingData;

  const { data: questionnaireFilters, isLoading: isQuestionnaireLoading } =
    useQuestionnaireFilters(currentOpportunityId || "", targetUserType || "");

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
    isFetching,
  } = useUserSearch(searchParams);

  useEffect(() => {
    if (searchParams && isFetching) {
      setIsSearching(true);
    } else if (!searchParams || (!isFetching && !isSearchLoading)) {
      setIsSearching(false);
    }
  }, [isFetching, isSearchLoading, searchParams]);

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
      const currentValues = form.getValues();
      const newFilterOptions = extractFilterOptions(
        searchData.results,
        filterableFields,
        currentValues
      );
      setFilterOptions(newFilterOptions);

      // Auto-select fields with 1 option
      setTimeout(() => {
        const currentFormValues = form.getValues();
        let hasChanges = false;

        Object.entries(newFilterOptions).forEach(([fieldName, options]) => {
          if (options.length === 1) {
            const optionValue = options[0].value;
            const currentValue = currentFormValues[fieldName];
            const autoSelectedKey = `${fieldName}:${optionValue}`;

            const isEmpty = !currentValue || 
              (Array.isArray(currentValue) && currentValue.length === 0);
/****************
 * Auto-select fields with 1 option
 * Only auto-select if:
 * 1. The field is empty
 * 2. We haven't already auto-selected this exact field:value combination
 */
            if (isEmpty && autoSelectedFieldsRef.current[fieldName] !== optionValue) {
              const isFieldVisible = filterableFields.some(
                (field) => field.field === fieldName
              );

              if (isFieldVisible) {
                const field = filterableFields.find(f => f.field === fieldName);
                const isMultiSelect = 
                  field?.type === "multi-select" ||
                  field?.type === "tag-select" ||
                  field?.type === "checkbox-group";

                if (isMultiSelect) {
                  form.setValue(fieldName, [optionValue]);
                } else {
                  form.setValue(fieldName, optionValue);
                }
                
                autoSelectedFieldsRef.current[fieldName] = optionValue;
                hasChanges = true;
              }
            }
          }
        });

        if (hasChanges) {
          const newFormValues = form.getValues();
          handleSearch(newFormValues);
        }
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchData?.results, filterableFields]);

  useEffect(() => {
    if (filterableFields.length > 0) {
      const defaultValues = getDefaultValues(filterableFields);
      form.reset(defaultValues);
      autoSelectedFieldsRef.current = {};
    }
  }, [filterableFields]);

  // Reset form when opportunity changes
  useEffect(() => {
    if (currentOpportunityId && filterableFields.length > 0) {
      const defaultValues = getDefaultValues(filterableFields);
      form.reset(defaultValues);
      autoSelectedFieldsRef.current = {};
    }
  }, [currentOpportunityId, filterableFields]);

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

  const handleSearch = useCallback(
    (data: FilterFormData) => {
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
        sort_by: "distance",
        ...Object.fromEntries(filteredEntries),
      };

      // Compare with previous search params to avoid redundant searches
      const newParamsStr = JSON.stringify(newSearchParams);
      
      if (previousSearchParamsRef.current === newParamsStr) {
        return;
      }

      previousSearchParamsRef.current = newParamsStr;
      setSearchParams(newSearchParams);
      setCurrentPage(1);
      setIsSearching(true);
    },
    [targetUserType, currentOpportunityId, pageSize]
  );

  const handleReset = () => {
    const autoSelectedValues: Record<string, any> = {};
    Object.keys(autoSelectedFieldsRef.current).forEach((fieldName) => {
      const currentValue = form.getValues()[fieldName];
      if (currentValue !== undefined && currentValue !== null) {
        autoSelectedValues[fieldName] = currentValue;
      }
    });

    const defaultValues = getDefaultValues(filterableFields);
    form.reset({ ...defaultValues, ...autoSelectedValues });
    
    setCurrentPage(1);

    if (targetUserType && currentOpportunityId) {
      // Build search params with auto-selected values
      const filteredEntries = Object.entries(autoSelectedValues).filter(
        ([_, value]) =>
          value && value !== "" && !(Array.isArray(value) && value.length === 0)
      );

      setSearchParams({
        user_type: targetUserType,
        opportunity_id: currentOpportunityId,
        sort_by: "distance",
        page: 1,
        page_size: pageSize,
        ...Object.fromEntries(filteredEntries),
      });
      setIsSearching(true);
    }
  };

  const handlePageChange = (page: number) => {
    if (!searchParams) return;

    setCurrentPage(page);
    setSearchParams({
      ...searchParams,
      page,
    });
    setIsSearching(true);
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
    setIsSearching(true);
  };

  useEffect(() => {
    return () => {
      setIsSearching(false);
    };
  }, []);

  useEffect(() => {
    if (!onboardingData || !targetUserType) return;

    const processedFields = new Map<string, ProcessedField>();
    const typedData = onboardingData as { onboarding_pages: any[] };

    if (typedData && Array.isArray(typedData)) {
      typedData.forEach((page: any) => {
        if (page.questions && Array.isArray(page.questions)) {
          page.questions.forEach((field: any) => {
            processFollowupQuestions(field, [], processedFields);
          });
        }
      });
    }

    if (questionnaireFilters && Array.isArray(questionnaireFilters)) {
      questionnaireFilters.forEach((field: any) => {
        const fieldWithSource = { ...field, source: "questionnaire" };
        processFollowupQuestions(fieldWithSource, [], processedFields);
      });
    }

    setFilterableFields(Array.from(processedFields.values()));
  }, [
    onboardingData,
    questionnaireFilters,
    processFollowupQuestions,
    targetUserType,
  ]);

  useEffect(() => {
    // Wait until we know enrollment (avoid flicker/extra calls)
    if (!isEnrollmentReady) return;

    if (!targetUserType || !currentOpportunityId || isEnrolled !== true) {
      setSearchParams(null);
      setIsSearching(false);
      setCurrentPage(1);
      return;
    }

    // Enrolled: prime the initial search
    setSearchParams({
      user_type: targetUserType,
      opportunity_id: currentOpportunityId,
      sort_by: "distance",
      page: 1,
      page_size: pageSize,
    });
    setCurrentPage(1);
    setIsSearching(true);
  }, [
    targetUserType,
    currentOpportunityId,
    pageSize,
    isEnrolled,
    isEnrollmentReady,
  ]);

  const hasSearchFilters = useMemo(() => {
    if (!searchParams) return false;
    const { user_type, opportunity_id, page, page_size, sort_by, ...filters } =
      searchParams;
    
    const userAppliedFilters = Object.entries(filters).filter(([fieldName, value]) => {
      const isAutoSelected = autoSelectedFieldsRef.current[fieldName] !== undefined;
      return !isAutoSelected;
    });
    
    return userAppliedFilters.length > 0;
  }, [searchParams]);

  const totalPages = useMemo(() => {
    if (!searchData?.count) return 1;
    return Math.ceil(searchData.count / pageSize);
  }, [searchData?.count, pageSize]);

  const wrappedHandleSearch = useMemo(
    () =>
      form.handleSubmit((data) => {
        handleSearch(data);
      }),
    [form, handleSearch]
  );

  return {
    searchResults: searchData?.results || [],
    hasSearched: hasSearchFilters,
    filterableFields,
    filterOptions,
    autoSelectedFields: autoSelectedFieldsRef.current,
    targetUserType,
    isLoading: isOnboardingLoading || isSearchLoading || isQuestionnaireLoading,
    isSearching,
    form,
    handleSearch: wrappedHandleSearch,
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
    opportunityId: currentOpportunityId,
  };
};

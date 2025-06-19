import React from "react";
import { 
  HStack, 
  VStack, 
  Text, 
  Button, 
  Input 
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

interface JumpToPageForm {
  pageNumber: string;
}

interface PageSizeForm {
  pageSize: string;
}

const jumpToPageSchema = yup.object({
  pageNumber: yup
    .string()
    .required("Page number is required")
    .test("is-number", "Please enter a valid page number", (value) => {
      if (!value) return false;
      const num = parseInt(value);
      return !isNaN(num) && num > 0;
    })
});

const pageSizeSchema = yup.object({
  pageSize: yup
    .string()
    .required("Page size is required")
    .test("is-valid-size", "Please enter a valid number (1-1000)", (value) => {
      if (!value) return false;
      const num = parseInt(value);
      return !isNaN(num) && num >= 1 && num <= 1000;
    })
});

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  isLoading = false
}: PaginationControlsProps) {
  const [jumpError, setJumpError] = React.useState<string>("");
  const [pageSizeError, setPageSizeError] = React.useState<string>("");

  const jumpForm = useForm<JumpToPageForm>({
    resolver: yupResolver(jumpToPageSchema),
    defaultValues: { pageNumber: "" }
  });

  const pageSizeForm = useForm<PageSizeForm>({
    resolver: yupResolver(pageSizeSchema),
    defaultValues: { pageSize: String(pageSize) }
  });

  React.useEffect(() => {
    if (jumpError) {
      const timer = setTimeout(() => setJumpError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [jumpError]);

  React.useEffect(() => {
    if (pageSizeError) {
      const timer = setTimeout(() => setPageSizeError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [pageSizeError]);

  React.useEffect(() => {
    pageSizeForm.setValue("pageSize", String(pageSize));
  }, [pageSize, pageSizeForm]);

  const handleJumpToPage = (data: JumpToPageForm) => {
    const page = parseInt(data.pageNumber);
    
    if (isNaN(page) || page < 1) {
      setJumpError("Please enter a valid page number");
      return;
    }
    
    if (page > totalPages) {
      setJumpError(`Page number exceeds total pages (${totalPages})`);
      return;
    }
    
    onPageChange(page);
    jumpForm.reset();
    setJumpError("");
  };

  const handlePageSizeChange = (data: PageSizeForm) => {
    const newPageSize = parseInt(data.pageSize);
    
    if (isNaN(newPageSize) || newPageSize < 1 || newPageSize > 1000) {
      setPageSizeError("Please enter a valid page size (1-1000)");
      return;
    }
    
    onPageSizeChange(newPageSize);
    setPageSizeError("");
  };

  const handleJumpError = (errors: any) => {
    if (errors.pageNumber) {
      setJumpError(errors.pageNumber.message);
    }
  };

  const handlePageSizeError = (errors: any) => {
    if (errors.pageSize) {
      setPageSizeError(errors.pageSize.message);
    }
  };

  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <VStack gap={4} w="full">
      {(jumpError || pageSizeError) && (
        <VStack gap={1} w="full" align="center">
          {jumpError && (
            <Text fontSize="sm" color="red.500">
              {jumpError}
            </Text>
          )}
          {pageSizeError && (
            <Text fontSize="sm" color="red.500">
              {pageSizeError}
            </Text>
          )}
        </VStack>
      )}

      <Text fontSize="sm" color="gray.600">
        Showing {startItem}-{endItem} of {totalCount} items
      </Text>

      <HStack gap={6} wrap="wrap" justify="center">
        <HStack gap={2}>
          <Text fontSize="sm">Page Size:</Text>
          <form onSubmit={pageSizeForm.handleSubmit(handlePageSizeChange, handlePageSizeError)}>
            <HStack gap={2}>
              <Input
                {...pageSizeForm.register("pageSize")}
                type="number"
                size="sm"
                width="80px"
                disabled={isLoading}
                onInvalid={(e) => e.preventDefault()}
              />
              <Button
                size="sm"
                variant="outline"
                type="submit"
                disabled={isLoading}
              >
                Apply
              </Button>
            </HStack>
          </form>
        </HStack>

        <HStack gap={2}>
          <Text fontSize="sm">Go to page:</Text>
          <form onSubmit={jumpForm.handleSubmit(handleJumpToPage, handleJumpError)}>
            <HStack gap={2}>
              <Input
                {...jumpForm.register("pageNumber")}
                type="number"
                placeholder="Page"
                size="sm"
                width="70px"
                disabled={isLoading}
                onInvalid={(e) => e.preventDefault()}
              />
              <Button
                size="sm"
                variant="outline"
                type="submit"
                disabled={isLoading}
              >
                Go
              </Button>
            </HStack>
          </form>
        </HStack>
      </HStack>

      <HStack justify="center" align="center" gap={4} wrap="wrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft size={16} />
          Previous
        </Button>

        <HStack gap={2}>
          {currentPage > 3 && totalPages > 5 && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(1)}
                disabled={isLoading}
              >
                1
              </Button>
              {currentPage > 4 && <Text>...</Text>}
            </>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              if (totalPages <= 5) return true;
              return page >= Math.max(1, currentPage - 2) && 
                     page <= Math.min(totalPages, currentPage + 2);
            })
            .map(page => (
              <Button
                key={page}
                size="sm"
                variant={page === currentPage ? "solid" : "outline"}
                bg={page === currentPage ? "#282F68" : undefined}
                color={page === currentPage ? "white" : undefined}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
              >
                {page}
              </Button>
            ))}

          {currentPage < totalPages - 2 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 3 && <Text>...</Text>}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(totalPages)}
                disabled={isLoading}
              >
                {totalPages}
              </Button>
            </>
          )}
        </HStack>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
          <ChevronRight size={16} />
        </Button>
      </HStack>
    </VStack>
  );
}
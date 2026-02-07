import { type ButtonProps, Button } from "@chakra-ui/react";
import { IconFilter } from "@/components/Icons";
// import { Button } from "@/components/ui/Button";

export interface FilterButtonProps extends ButtonProps {
  label?: string;
  paddingX?: number;
}

export function FilterButton({
  label,
  paddingX = 4,
  ...buttonProps
}: FilterButtonProps) {
  return (
    <Button
      variant="outline"
      justifyContent="flex-start"
      gap={2}
      py="14px"
      px={paddingX}
      borderRadius="xl"
      borderColor="#E4E4E7"
      borderWidth="1px"
      bg="white"
      color="#27272A"
      fontWeight="normal"
      fontSize="md"
      {...buttonProps}
    >
      <IconFilter color="#3F3F46" />
      {label && <>{label}</>}
    </Button>
  );
}

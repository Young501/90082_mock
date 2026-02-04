import { Box, Text, Select, createListCollection } from "@chakra-ui/react";
import React from "react";

export const SortComponent = () => {
  return (
    <Box>
      <Text>Sort by</Text>
      <Select.Root
        collection={createListCollection({
          items: [
            { label: "Distance", value: "distance" },
            { label: "Best Match", value: "best_match" },
          ],
        })}
      >
        <Select.HiddenSelect />
        <Select.Control>
          <Select.Trigger>
            <Select.ValueText>Distance</Select.ValueText>
          </Select.Trigger>
        </Select.Control>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Root>
    </Box>
  );
};

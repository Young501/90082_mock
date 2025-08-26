import { Box, Spinner, Text } from "@chakra-ui/react";
import React from "react";

const Loader = ({
  size = "xl",
  color = "#002157",
  animationDuration = "0.8s",
  props,
  type = "component",
  text,
}: {
  size?: "xl" | "sm" | "md" | "lg" | "inherit" | "xs";
  color?: string;
  animationDuration?: string;
  props?: any;
  type?: "page" | "component";
  text?: string;
}) => {
  return (
    <>
      {type === "component" && (
        <Box display="flex" justifyContent="center" py={10}>
          <Spinner
            size={size}
            color={color}
            animationDuration={animationDuration}
            {...props}
          />
        </Box>
      )}
      {type === "page" && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          h="100%"
          gap={4}
        >
          <Loader type="component" />
          <Text fontSize="2xl" fontWeight="bold">
            {text || "Loading..."}
          </Text>
        </Box>
      )}
    </>
  );
};

export default Loader;

import { Box, Spinner } from "@chakra-ui/react";
import React from "react";

const Loader = ({
  size = "xl",
  color = "#002157",
  animationDuration = "0.8s",
  props,
}: {
  size?: "xl" | "sm" | "md" | "lg" | "inherit" | "xs";
  color?: string;
  animationDuration?: string;
  props?: any;
}) => {
  return (
    <Box display="flex" justifyContent="center" py={10}>
      <Spinner
        size={size}
        color={color}
        animationDuration={animationDuration}
        {...props}
      />
    </Box>
  );
};

export default Loader;

"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, HStack, Input, Text } from "@chakra-ui/react";
import { Search } from "lucide-react";

interface DebouncedSearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function DebouncedSearchInput({
  value: externalValue = "",
  onChange,
  placeholder = "Search by name or email",
  debounceMs = 600,
}: DebouncedSearchInputProps) {
  const [inputValue, setInputValue] = useState(externalValue);
  const [committed, setCommitted] = useState(externalValue);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    setInputValue(externalValue);
    setCommitted(externalValue);
  }, [externalValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCommitted(inputValue);
      onChangeRef.current(inputValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [inputValue, debounceMs]);

  const handleReset = () => {
    setInputValue("");
    setCommitted("");
    onChange("");
  };

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="#E4E4E7"
      borderRadius="12px"
      p={4}
      w="100%"
    >
      <HStack gap={3}>
        <Box position="relative" flex={1}>
          <Box
            position="absolute"
            left={3}
            top="50%"
            transform="translateY(-50%)"
            zIndex={1}
            pointerEvents="none"
          >
            <Search size={16} color="#A1A1AA" />
          </Box>
          <Input
            pl={9}
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            bg="#F4F4F5"
            border="none"
            borderRadius="8px"
            fontSize="sm"
            _focus={{ boxShadow: "none", bg: "#EFEFEF" }}
          />
        </Box>
        {committed && (
          <Text
            fontSize="sm"
            color="#71717A"
            cursor="pointer"
            fontWeight="500"
            flexShrink={0}
            onClick={handleReset}
          >
            Reset
          </Text>
        )}
      </HStack>
    </Box>
  );
}

"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Box, Heading, Text, VStack, Link } from "@chakra-ui/react";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

interface MarkdownRendererProps {
  content: string;
  title: string;
  lastUpdated?: string;
  version?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  title,
  lastUpdated,
  version,
}) => {
  const components = {
    h1: ({ children, ...props }: any) => (
      <Heading
        as="h1"
        size="xl"
        color="#282F68"
        fontWeight="bold"
        mb={4}
        mt={6}
        {...props}
      >
        {children}
      </Heading>
    ),
    h2: ({ children, ...props }: any) => (
      <Heading
        as="h2"
        size="lg"
        color="#282F68"
        fontWeight="bold"
        mb={3}
        mt={5}
        {...props}
      >
        {children}
      </Heading>
    ),
    h3: ({ children, ...props }: any) => (
      <Heading
        as="h3"
        size="md"
        color="#282F68"
        fontWeight="bold"
        mb={2}
        mt={4}
        {...props}
      >
        {children}
      </Heading>
    ),
    p: ({ children, ...props }: any) => (
      <Text fontSize="16px" lineHeight="1.6" color="#333" mb={3} {...props}>
        {children}
      </Text>
    ),
    strong: ({ children, ...props }: any) => (
      <Text as="span" fontWeight="bold" color="#282F68" {...props}>
        {children}
      </Text>
    ),
    em: ({ children, ...props }: any) => (
      <Text as="span" fontStyle="italic" {...props}>
        {children}
      </Text>
    ),
    ul: ({ children, ...props }: any) => (
      <Box
        as="ul"
        gap={2}
        mb={4}
        pl={4}
        listStyleType="disc"
        listStylePosition="outside"
        {...props}
      >
        {children}
      </Box>
    ),
    ol: ({ children, ...props }: any) => (
      <Box
        as="ol"
        gap={2}
        mb={4}
        pl={4}
        listStyleType="decimal"
        listStylePosition="outside"
        {...props}
      >
        {children}
      </Box>
    ),
    li: ({ children, ...props }: any) => (
      <Box
        as="li"
        fontSize="16px"
        lineHeight="1.6"
        color="#333"
        mb={1}
        {...props}
      >
        {children}
      </Box>
    ),
    blockquote: ({ children, ...props }: any) => (
      <Box
        pl={4}
        py={2}
        my={4}
        bg="gray.50"
        borderRadius="md"
        borderLeft="4px solid #282F68"
        {...props}
      >
        {children}
      </Box>
    ),
    a: ({ href, children, ...props }: any) => (
      <Link
        href={href}
        color="#282F68"
        textDecoration="underline"
        _hover={{ color: "#1a1f4a" }}
        isExternal={href?.startsWith("http")}
        {...props}
      >
        {children}
        {href?.startsWith("http") && (
          <ExternalLink size={12} style={{ marginLeft: "2px" }} />
        )}
      </Link>
    ),
    u: ({ children, ...props }: any) => (
      <Text as="span" textDecoration="none" {...props}>
        {children}
      </Text>
    ),
    img: ({ src, alt, ...props }: any) => (
      <Box my={4} textAlign="center">
        <Image
          src={src || ""}
          alt={alt || ""}
          width={800}
          height={600}
          style={{ maxWidth: "100%", height: "auto" }}
          {...props}
        />
      </Box>
    ),
  };

  return (
    <Box mx="auto" p={6}>
      <style jsx>{`
        ul li::marker {
          font-weight: bold;
          font-size: 16px;
          color: #282f68;
        }
        ol li::marker {
          font-weight: bold;
          font-size: 16px;
          color: #282f68;
        }
      `}</style>
      <VStack align="stretch" gap={6}>
        <Box textAlign="center" borderBottom="2px solid #282F68" pb={4}>
          <Heading as="h1" size="2xl" color="#282F68" fontWeight="bold" mb={2}>
            {title}
          </Heading>
          {(lastUpdated || version) && (
            <VStack gap={1}>
              {lastUpdated && (
                <Text fontSize="sm">
                  <span style={{ fontWeight: "bold", color: "#282F68" }}>
                    Last updated:
                  </span>{" "}
                  {lastUpdated}
                </Text>
              )}
              {version && (
                <Text fontSize="sm">
                  <span style={{ fontWeight: "bold", color: "#282F68" }}>
                    Version:
                  </span>{" "}
                  {version}
                </Text>
              )}
            </VStack>
          )}
        </Box>

        <Box bg="white" borderRadius="lg" px={8} pb={8}>
          <ReactMarkdown components={components} rehypePlugins={[rehypeRaw]}>
            {content}
          </ReactMarkdown>
        </Box>
      </VStack>
    </Box>
  );
};

export default MarkdownRenderer;

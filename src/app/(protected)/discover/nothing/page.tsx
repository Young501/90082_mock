"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import React from "react";
import NextLink from "next/link";
import Image from "next/image";
import {Box,Flex,Heading,Text,Button,VStack,} from "@chakra-ui/react";
import { PageTitle } from "@/components/PageTitle"; 
import { PAGE_TITLES } from "@/utils/pageTitles";
import Footer from "@/components/Layouts/Footer";


export default function DiscoverStaticPage() {
  const searchParams = useSearchParams();
const id = searchParams.get("id");
const title = searchParams.get("title");

  const [keyword, setKeyword] = useState<string>("");
  useEffect(() => {
  if (title) {
    setKeyword(title);
  } else {
    setKeyword("None");
  }
}, [title]);
 

  return (
    <Box display="flex" flexDirection="column" minH="100vh" position="relative">
      <PageTitle title={PAGE_TITLES.DISCOVER} />
  <Box position="absolute" inset={0} zIndex={-1}>
      {/* left background picture*/}
      <Box
        position="absolute"
        top={130}
        left={-450}
        w={{ base: "50vw", lg: "40vw" }}
        h={{ base: "8vw", lg: "20vw" }}
        zIndex={-1}
        bgImage="url('/assets/background-image.png')"
        bgRepeat="no-repeat"
        bgSize="contain"
        transform="scaleX(-1)"
        
      />

      {/* right backgroun picture*/}
      <Box
        position="absolute"
        top={130}
        right={-450}
        w={{ base: "50vw", lg: "40vw" }}
        h={{ base: "8vw", lg: "20vw" }}
        zIndex={-1}
        bgImage="url('/assets/background-image.png')"
        bgRepeat="no-repeat"
        bgSize="contain"
        transform="scaleX(1)"
      />
      </Box>

      {/* main body */}
      <Box
        flex="1"
        px={{ base: 6, md: 12, lg: 24 }}
        mt={{ base: "80px", lg: "126px" }}
        pb={{ base: 8, lg: 12 }}
      >
 
        {/* head i add if title shows unknown*/}
        <Heading
  as="h1"
  fontSize={{ base: "2xl", md: "4xl" }}
  textAlign="center"
  mt={{ base: 8, md: 12 }}
  mb={{ base: 8, md: 20 }}
  lineHeight="1.3"
>
  {keyword === "Unknown" ? (
    <>You don’t have any opportunities yet</>
  ) : (
    <>
      You’ve discovered the{" "}
      <Box
        as="span"
        bg="blue.600"
        color="white"
        px={4}
        py={2}
        borderRadius="full"
        display="inline-block"
      >
        {keyword}
      </Box>{" "}
      opportunity
    </>
  )}
</Heading>

        {/* picture + text part */}
        <Box maxW="600px" mx="auto" w="100%">
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="center"
          gap={{ base: 8, lg: 16 }}
        >
          {/* picture in left */}
          <Box flexShrink={0}>
            <Image
              src="/assets/discoverNothing.png" 
              alt="Discover"
              width={400}
              height={300}
              style={{ height: "auto", width: "100%", maxWidth: "200px" }}
              priority
            />
          </Box>

          {/* text in right + button */}
            <VStack
              align="flex-start"
              gap={6}
              maxW="560px"
              w="100%">
            <Text fontSize="lg" color="gray.600">
              Ready to connect with industry partners seeking university talent?
              Join the Employment Opportunity to access part-time, casual, and
              graduate roles within your university community.
              </Text>
              
          <NextLink href="/invite">
          <Button
           colorScheme="green"
           bg="green.600"
           color="white"
           _hover={{ bg: "green.600" }}
           size="lg"
           borderRadius="xl"
           h="36px"
           w={{ base: "full", md: "100px" }}
    
                >
           Enrol
         </Button>
         </NextLink>
          </VStack>
          </Flex>
          </Box>
      
      </Box>
    
      <Footer />
    </Box>
  );
}
import { AccessibleOpportunity } from "@/services/shared";

// Mock data
export const MOCK_OPPORTUNITIES: AccessibleOpportunity[] = [
  {
    id: 1,
    title: "Summer Internship Program 2024",
    status: "Enrolled"
  },
  {
    id: 2,
    title: "Research Opportunity",
    status: "Not Enrolled"
  },
  {
    id: 3,
    title: "Industry Partnership Project",
    status: "Enrolled"
  },
  {
    id: 4,
    title: "Startup Accelerator Program",
    status: "Not Enrolled"
  },
  {
    id: 5,
    title: "Mentorship Program",
    status: "Enrolled"
  }
];

// different scenarios Mock data
export const MOCK_SCENARIOS = {
  // no opportunities scenario
  NO_OPPORTUNITIES: [],
  
  // single opportunity scenario
  SINGLE_OPPORTUNITY: [
    {
      id: 1,
      title: "Summer Internship Program 2024",
      status: "Enrolled" as const
    }
  ],
  
  // multiple opportunities scenario
  MULTIPLE_OPPORTUNITIES: MOCK_OPPORTUNITIES,
  
  // only not enrolled opportunities
  NOT_ENROLLED_ONLY: [
    {
      id: 1,
      title: "New Research Project",
      status: "Not Enrolled" as const
    },
    {
      id: 2,
      title: "Industry Workshop",
      status: "Not Enrolled" as const
    }
  ]
};

// simulate network delay
export const simulateNetworkDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

// simulate random error
export const simulateRandomError = (errorRate: number = 0.1) => {
  if (Math.random() < errorRate) {
    throw new Error("Mock network error");
  }
};

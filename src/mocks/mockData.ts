import type { HomepageStats } from "@/types/homepage";
import type { Folder, FolderMember } from "@/types/folder";
import type { MessagingUser } from "@/types/messaging";
import type { AccessibleOpportunity } from "@/types/opportunities";
import type { Organisation, OrganisationMember } from "@/types/shared";
import type { User, UserDetailsV2 } from "@/types/user";

export type MockUserType = "student" | "organisation" | "coordinator";

const MOCK_USER_TYPE_KEY = "uc_mock_user_type";

export const mockUniversity = {
  id: 1,
  name: "University Of Melbourne",
  slug: "unimelb",
  logo_url: "/assets/meluni2.png",
  links: [
    {
      label: "Know your rights",
      url: "https://students.unimelb.edu.au/careers/find-a-job/your-work-rights",
    },
    {
      label: "University Career Services",
      url: "https://about.unimelb.edu.au/careers",
    },
  ],
};

const access = {
  has_access: true,
  access_source: "rule" as const,
  requires_subscription: false,
  trial_eligibility: null,
  subscription: null,
  active_override: null,
  entitlement_expires_at: null,
  next_action: "none" as const,
};

export const mockOpportunities: AccessibleOpportunity[] = [
  {
    id: 1,
    public_id: "mock-mtsi-2027",
    title: "MTSI 2027 Teaching Placement",
    description:
      "A prototype placement opportunity connecting Master of Teaching students with school partners.",
    logo_url: "/assets/opportunityLogoPlaceholder.svg",
    start_date: "2027-02-01",
    end_date: "2027-11-30",
    created_by: 301,
    is_active: true,
    created_at: "2026-08-01T09:00:00Z",
    updated_at: "2026-08-18T09:00:00Z",
    questionnaire: {},
    enrollment_status: "enrolled",
    visibility_display: "Private",
    access,
    slug: "mtsi-2027",
    is_default: true,
    is_hidden: false,
    links: [{ label: "Program guide", url: "https://example.com/mtsi" }],
    enrollment_preview: {
      student: {
        heading: "Join the MTSI placement pool",
        benefits: [
          "Share your teaching preferences",
          "Be discoverable to coordinator-approved schools",
          "Receive messages from matched partners",
        ],
      },
      organisation: {
        heading: "Find teaching talent",
        benefits: [
          "Review student readiness",
          "Shortlist candidates into folders",
          "Message students directly",
        ],
      },
    },
    coordinator: {
      id: 301,
      first_name: "Avery",
      last_name: "Coordinator",
      profile_picture_url: null,
    },
    university: mockUniversity,
  },
  {
    id: 2,
    public_id: "mock-employment",
    title: "Employment Access",
    description:
      "Access a searchable pool of students interested in casual, part-time, graduate and professional roles.",
    logo_url: "/assets/employment.svg",
    start_date: "2026-09-01",
    end_date: "2027-08-31",
    created_by: 301,
    is_active: true,
    created_at: "2026-08-03T09:00:00Z",
    updated_at: "2026-08-18T09:00:00Z",
    questionnaire: {},
    enrollment_status: "not_enrolled",
    visibility_display: "Public",
    access: { ...access, requires_subscription: true },
    slug: "employment",
    is_default: false,
    is_hidden: false,
    links: [{ label: "Employer info", url: "https://example.com/employment" }],
    enrollment_preview: null,
    coordinator: null,
    university: mockUniversity,
  },
  {
    id: 3,
    public_id: "mock-eio",
    title: "Entrepreneurship Internship Opportunity",
    description:
      "Prototype internship listings for startups, social enterprises and innovation teams.",
    logo_url: "/assets/internship.svg",
    start_date: "2026-10-01",
    end_date: "2027-03-31",
    created_by: 301,
    is_active: true,
    created_at: "2026-08-06T09:00:00Z",
    updated_at: "2026-08-19T09:00:00Z",
    questionnaire: {},
    enrollment_status: "enrolled",
    visibility_display: "Private",
    access,
    slug: "eio",
    is_default: false,
    is_hidden: false,
    links: [],
    enrollment_preview: null,
    coordinator: null,
    university: mockUniversity,
  },
];

export const mockStudentProfile = {
  id: 101,
  first_name: "Mia",
  last_name: "Chen",
  location: "Parkville VIC, Australia",
  distance_km: 4.2,
  profile_picture_url: null,
  degree: "Master",
  course_stream: {
    id: 11,
    code: "teaching_secondary",
    label: "Teaching Secondary",
  },
  specialisations: ["Mathematics", "Science"],
  progression: "PG Year 2",
  faculty: "Education",
  skills: ["Lesson planning", "Tutoring", "Data analysis"],
  credentials: ["Working with Children Check", "First Aid"],
  preferred_location: ["Local", "Regional"],
  availability: "2 days per week",
  status: "Domestic",
  bio: "Master of Teaching student interested in STEM classrooms and inclusive learning design.",
  linkedin: "https://www.linkedin.com/in/mock-student",
  resume_url: "/documents/legal/UniConnectED Terms and Conditions student.pdf",
  preferred_distance_km: 25,
  university: mockUniversity,
  matched: true,
  match_score: 92,
  questionnaire_answers: [
    {
      field: "placement_goals",
      label: "Placement goals",
      value: "Build classroom confidence and work with senior mathematics students.",
    },
  ],
};

export const mockStudents = [
  mockStudentProfile,
  {
    ...mockStudentProfile,
    id: 102,
    first_name: "Noah",
    last_name: "Patel",
    distance_km: 12.6,
    specialisations: ["English", "Humanities"],
    skills: ["Mentoring", "Report writing", "Communication"],
    credentials: ["Working with Children Check"],
    matched: false,
    match_score: 81,
  },
  {
    ...mockStudentProfile,
    id: 103,
    first_name: "Olivia",
    last_name: "Nguyen",
    distance_km: 31.4,
    specialisations: ["Biology", "Chemistry"],
    preferred_location: ["Regional"],
    skills: ["Laboratory techniques", "Science support", "Tutoring"],
    matched: true,
    match_score: 88,
  },
];

export const mockOrganisation: Organisation = {
  id: 201,
  name: "Northside Learning Collective",
  logo_url: "/assets/opportunityLogoPlaceholder.svg",
  description:
    "A prototype school partner focused on STEM enrichment and student wellbeing.",
  email_domain: "northside.example",
  sector: "Education",
  industry: "Independent",
  location: "Carlton VIC, Australia",
  website: "https://example.com/northside",
  linkedin: "https://www.linkedin.com/company/example",
  abn_acn: "12345678901",
  allow_contact: true,
  company_size: "51-200",
  contact_email: "placements@northside.example",
  member_count: 3,
};

export const mockOrganisationMember = {
  id: 401,
  user_id: 201,
  first_name: "Sam",
  last_name: "Taylor",
  full_name: "Sam Taylor",
  email: "sam@northside.example",
  job_title: "Partnerships Lead",
  platform_role: "admin" as const,
  profile_picture_url: null,
  member_since: "2026-05-10",
  joined_at: "2026-05-10T10:00:00Z",
};

export const mockOrganisationMembers: OrganisationMember[] = [
  mockOrganisationMember,
  {
    id: 402,
    user_id: 202,
    first_name: "Priya",
    last_name: "Singh",
    full_name: "Priya Singh",
    email: "priya@northside.example",
    job_title: "Program Manager",
    platform_role: "member",
    profile_picture_url: null,
    member_since: "2026-06-12",
    joined_at: "2026-06-12T10:00:00Z",
  },
];

export const mockOrganisations = [
  {
    id: 201,
    first_name: "Sam",
    last_name: "Taylor",
    organisation: mockOrganisation,
    location: mockOrganisation.location,
    distance_km: 4.8,
    name: mockOrganisation.name,
    sector: mockOrganisation.sector,
    industry: mockOrganisation.industry,
    company_size: mockOrganisation.company_size,
    logo_url: mockOrganisation.logo_url,
    abn_acn: mockOrganisation.abn_acn,
    website: mockOrganisation.website,
    allow_contact: true,
    contact_email: mockOrganisation.contact_email,
    description: mockOrganisation.description,
    match_score: 89,
    members: mockOrganisationMembers,
  },
  {
    id: 202,
    first_name: "Jordan",
    last_name: "Lee",
    organisation: {
      ...mockOrganisation,
      id: 202,
      name: "Metro STEM Hub",
      location: "Brunswick VIC, Australia",
    },
    location: "Brunswick VIC, Australia",
    distance_km: 9.1,
    name: "Metro STEM Hub",
    sector: "Education",
    industry: "Non-profit",
    logo_url: "/assets/opportunityLogoPlaceholder.svg",
    allow_contact: true,
    contact_email: "hello@metrostem.example",
    description: "A community STEM learning provider.",
    match_score: 84,
    members: [],
  },
];

export const mockUsersByType: Record<MockUserType, User> = {
  student: {
    id: "101",
    email: "student@mock.local",
    user_types: ["student"],
    first_name: "Mia",
    last_name: "Chen",
    profile_picture_url: undefined,
    university: {
      name: mockUniversity.name,
      slug: mockUniversity.slug,
      logo_url: mockUniversity.logo_url,
      links: {
        careers: "https://about.unimelb.edu.au/careers",
      },
    },
  },
  organisation: {
    id: "201",
    email: "sam@northside.example",
    user_types: ["organisation"],
    first_name: "Sam",
    last_name: "Taylor",
    profile_picture_url: undefined,
  },
  coordinator: {
    id: "301",
    email: "coordinator@mock.local",
    user_types: ["coordinator"],
    first_name: "Avery",
    last_name: "Coordinator",
    profile_picture_url: undefined,
  },
};

export const mockUserDetailsByType: Record<MockUserType, UserDetailsV2> = {
  student: {
    id: 101,
    email: "student@mock.local",
    first_name: "Mia",
    last_name: "Chen",
    profile_picture_url: undefined,
    email_verified: true,
    user_types: [{ key: "student", name: "Student" }],
    location: {
      id: 1,
      formatted_address: "Parkville VIC, Australia",
      latitude: "-37.7983",
      longitude: "144.9609",
    },
  },
  organisation: {
    id: 201,
    email: "sam@northside.example",
    first_name: "Sam",
    last_name: "Taylor",
    profile_picture_url: undefined,
    email_verified: true,
    user_types: [{ key: "organisation", name: "Organisation" }],
    location: {
      id: 2,
      formatted_address: "Carlton VIC, Australia",
      latitude: "-37.8001",
      longitude: "144.9671",
    },
  },
  coordinator: {
    id: 301,
    email: "coordinator@mock.local",
    first_name: "Avery",
    last_name: "Coordinator",
    profile_picture_url: undefined,
    email_verified: true,
    user_types: [{ key: "coordinator", name: "Coordinator" }],
  },
};

const northsideUser: MessagingUser = {
  id: 201,
  email: "sam@northside.example",
  full_name: "Sam Taylor",
  user_types: ["organisation"],
  profile_picture_url: null,
  organisation_name: "Northside Learning Collective",
  organisation_logo_url: "/assets/opportunityLogoPlaceholder.svg",
  organisation_id: 201,
};

const studentUser: MessagingUser = {
  id: 101,
  email: "student@mock.local",
  full_name: "Mia Chen",
  user_types: ["student"],
  profile_picture_url: null,
  organisation_name: null,
  organisation_logo_url: null,
  organisation_id: null,
};

const coordinatorUser: MessagingUser = {
  id: 301,
  email: "coordinator@mock.local",
  full_name: "Avery Coordinator",
  user_types: ["coordinator"],
  profile_picture_url: null,
  organisation_name: null,
  organisation_logo_url: null,
  organisation_id: null,
};

export const mockConversations = [
  {
    id: 501,
    other_user: studentUser,
    opportunity_id: 1,
    opportunity_title: "MTSI 2027 Teaching Placement",
    last_message: {
      id: 9002,
      sender: studentUser,
      content: "Happy to share my placement preferences before Friday.",
      created_at: "2026-08-24T01:20:00Z",
      is_soft_deleted: false,
    },
    last_message_at: "2026-08-24T01:20:00Z",
    has_unread: true,
    unread_count: 1,
    is_archived: false,
    created_at: "2026-08-20T04:00:00Z",
  },
  {
    id: 502,
    other_user: northsideUser,
    opportunity_id: 1,
    opportunity_title: "MTSI 2027 Teaching Placement",
    last_message: {
      id: 9102,
      sender: northsideUser,
      content: "We can take two students for the first placement block.",
      created_at: "2026-08-23T23:45:00Z",
      is_soft_deleted: false,
    },
    last_message_at: "2026-08-23T23:45:00Z",
    has_unread: false,
    unread_count: 0,
    is_archived: false,
    created_at: "2026-08-19T04:00:00Z",
  },
];

export const mockMessagesByConversation = {
  501: [
    {
      id: 9001,
      sender: northsideUser,
      content: "Hi Mia, your STEM background looks like a strong fit.",
      created_at: "2026-08-23T23:05:00Z",
      is_soft_deleted: false,
      attachments: [],
      is_edited: false,
      edited_at: null,
    },
    {
      id: 9002,
      sender: studentUser,
      content: "Happy to share my placement preferences before Friday.",
      created_at: "2026-08-24T01:20:00Z",
      is_soft_deleted: false,
      attachments: [],
      is_edited: false,
      edited_at: null,
    },
  ],
  502: [
    {
      id: 9101,
      sender: coordinatorUser,
      content: "Can you confirm your available placement capacity?",
      created_at: "2026-08-23T22:10:00Z",
      is_soft_deleted: false,
      attachments: [],
      is_edited: false,
      edited_at: null,
    },
    {
      id: 9102,
      sender: northsideUser,
      content: "We can take two students for the first placement block.",
      created_at: "2026-08-23T23:45:00Z",
      is_soft_deleted: false,
      attachments: [],
      is_edited: false,
      edited_at: null,
    },
  ],
} as Record<number, any[]>;

export const mockFolders: Folder[] = [
  {
    id: 701,
    name: "Strong STEM candidates",
    description: "Shortlist for secondary mathematics and science roles.",
    member_count: 2,
    member_avatars: [
      { avatar_url: "", type: "student" as const },
      { avatar_url: "", type: "student" as const },
    ],
    created_at: "2026-08-18T09:00:00Z",
    updated_at: "2026-08-22T09:00:00Z",
  },
];

export const mockFolderMembers: FolderMember[] = [
  {
    id: 801,
    member_type: "student" as const,
    profile: {
      id: 101,
      first_name: "Mia",
      last_name: "Chen",
      profile_picture_url: null,
      degree: "Master",
      course_stream: "Teaching Secondary",
      specialisations: "Mathematics, Science",
      progression: "PG Year 2",
      skills: ["Lesson planning", "Tutoring", "Data analysis"],
      credentials: ["Working with Children Check", "First Aid"],
      preferred_location: "Local",
      questionnaire_answers: {},
      matched: true,
      location: "Parkville VIC, Australia",
      distance_km: 4.2,
    },
    added_at: "2026-08-22T09:00:00Z",
  },
];

export const mockTaxonomyNodes: Array<{
  id: number;
  type: string;
  code: string;
  label: string;
  parent?: string;
}> = [
  { id: 1, type: "faculty", code: "education", label: "Education" },
  { id: 2, type: "faculty", code: "science", label: "Science" },
  {
    id: 11,
    type: "course_stream",
    code: "teaching_secondary",
    label: "Teaching Secondary",
    parent: "education",
  },
  {
    id: 12,
    type: "course_stream",
    code: "computer_science",
    label: "Computer Science",
    parent: "science",
  },
  { id: 21, type: "skill", code: "lesson_planning", label: "Lesson planning" },
  { id: 22, type: "skill", code: "data_analysis", label: "Data analysis" },
  { id: 23, type: "credential", code: "wwcc", label: "Working with Children Check" },
];

export function getRoleFromEmail(email?: string): MockUserType {
  const normalized = email?.toLowerCase() ?? "";
  if (normalized.includes("student")) return "student";
  if (normalized.includes("coord")) return "coordinator";
  return "organisation";
}

export function setActiveUserType(userType: MockUserType) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MOCK_USER_TYPE_KEY, userType);
  }
}

export function getActiveUserType(): MockUserType {
  if (typeof window === "undefined") return "organisation";
  const stored = window.localStorage.getItem(MOCK_USER_TYPE_KEY);
  if (
    stored === "student" ||
    stored === "organisation" ||
    stored === "coordinator"
  ) {
    return stored;
  }
  return "organisation";
}

export function getActiveUser(): User {
  return mockUsersByType[getActiveUserType()];
}

export function getActiveUserDetails(): UserDetailsV2 {
  return mockUserDetailsByType[getActiveUserType()];
}

export function getOpportunity(
  idOrSlug: string | number
): AccessibleOpportunity | undefined {
  return mockOpportunities.find(
    (opportunity) =>
      String(opportunity.id) === String(idOrSlug) ||
      opportunity.slug === String(idOrSlug) ||
      opportunity.public_id === String(idOrSlug)
  );
}

function getHomepageOpportunities() {
  return mockOpportunities.map((opportunity) => ({
    ...opportunity,
    visibility: opportunity.visibility_display === "Public" ? 1 : 2,
  }));
}

export function getHomepageData(): HomepageStats {
  const userType = getActiveUserType();
  if (userType === "student") {
    return {
      user_type: "student",
      profile: {
        logo_url: mockUniversity.logo_url,
        name: "Mia Chen",
        profile_picture_url: null,
        course_name: "Master of Teaching",
        course_progression: "PG Year 2",
        skills: ["Lesson planning", "Tutoring", "Data analysis"],
        completion_items: [
          { key: "profile", label: "Profile", completed: true },
          { key: "resume", label: "Resume", completed: true },
          { key: "opportunity", label: "Opportunity preferences", completed: true },
        ],
      },
      opportunities: getHomepageOpportunities(),
      recent_messages: mockConversations,
    };
  }

  return {
    user_type: "organisation",
    profile: {
      logo_url: mockOrganisation.logo_url ?? null,
      organisation_name: mockOrganisation.name,
      abn: mockOrganisation.abn_acn,
      completion_items: [
        { key: "profile", label: "Organisation profile", completed: true },
        { key: "team", label: "Team", completed: true },
        { key: "opportunity", label: "Opportunity access", completed: true },
      ],
    },
    opportunities: getHomepageOpportunities(),
    recent_messages: mockConversations,
    team_members: mockOrganisationMembers.map((member) => ({
      id: member.id,
      full_name: member.full_name ?? "",
      email: member.email ?? "",
      role: member.platform_role,
      job_title: member.job_title,
      profile_picture_url: member.profile_picture_url,
      member_since: member.member_since,
    })),
  };
}

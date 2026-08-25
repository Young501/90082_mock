import type { AxiosInstance, AxiosRequestConfig } from "axios";
import MockAdapter from "axios-mock-adapter";
import {
  getActiveUser,
  getActiveUserDetails,
  getHomepageData,
  getOpportunity,
  getRoleFromEmail,
  mockConversations,
  mockFolderMembers,
  mockFolders,
  mockMessagesByConversation,
  mockOpportunities,
  mockOrganisation,
  mockOrganisationMember,
  mockOrganisationMembers,
  mockOrganisations,
  mockStudentProfile,
  mockStudents,
  mockTaxonomyNodes,
  setActiveUserType,
} from "./mockData";

type MockResponse = [number, unknown?];
const mockApiReadyKey = "__uniconnectedMockApiReady";

const ok = (data: unknown = {}): MockResponse => [200, data];
const created = (data: unknown = {}): MockResponse => [201, data];
const noContent = (): MockResponse => [204];

function body(config: AxiosRequestConfig): Record<string, unknown> {
  if (!config.data) return {};
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (config.data instanceof FormData) {
    return Object.fromEntries(config.data.entries());
  }
  return config.data as Record<string, unknown>;
}

function params(config: AxiosRequestConfig): Record<string, string> {
  return Object.fromEntries(
    Object.entries(config.params ?? {}).map(([key, value]) => [
      key,
      String(value),
    ])
  );
}

function paginated<T>(results: T[]) {
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

function findOpportunityIdFromUrl(url?: string): string {
  const match = url?.match(/\/api\/v2\/opportunities\/([^/]+)\//);
  return match?.[1] ?? "1";
}

function activeParticipant() {
  const opportunity = getOpportunity(1);
  return {
    user_type_key: getActiveUser().user_types[0],
    participant_id: 1001,
    email: getActiveUser().email,
    accepted: true,
    type: getActiveUser().user_types[0],
    data: JSON.stringify({ prototype: true }),
    access: opportunity?.access,
  };
}

function folderDetail(folderId: string) {
  const folder = mockFolders.find((item) => String(item.id) === folderId);
  if (!folder) return null;
  return {
    ...folder,
    opportunity_slug: "mtsi-2027",
    members: mockFolderMembers,
  };
}

export function setupMockApi(apiClient: AxiosInstance) {
  const globalScope = globalThis as typeof globalThis &
    Record<string, boolean | undefined>;

  if (globalScope[mockApiReadyKey]) return;
  globalScope[mockApiReadyKey] = true;

  const mock = new MockAdapter(apiClient, {
    delayResponse: 350,
    onNoMatch: "throwException",
  });

  mock.onPost(/\/api\/v1\/login\/?$/).reply((config) => {
    const payload = body(config);
    const role = getRoleFromEmail(String(payload.email ?? ""));
    setActiveUserType(role);
    return ok({
      token: `mock-token-${role}`,
      user: {
        ...getActiveUser(),
        userDetailsV2: getActiveUserDetails(),
      },
    });
  });

  mock.onPost(/\/api\/v1\/signup\/?$/).reply((config) => {
    const payload = body(config) as { user_types?: string[] };
    const requestedType = payload.user_types?.[0];
    if (
      requestedType === "student" ||
      requestedType === "organisation" ||
      requestedType === "coordinator"
    ) {
      setActiveUserType(requestedType);
    }
    return created({
      message: "Mock account created. Continue to the prototype flow.",
    });
  });

  mock.onPost(/\/api\/v1\/logout\/?$/).reply(() => ok({ detail: "Logged out" }));
  mock
    .onPost(/\/api\/v1\/change-password\/?$/)
    .reply(() => ok({ detail: "Password changed in mock mode" }));
  mock
    .onPost(/\/api\/v1\/reset-password\/?$/)
    .reply(() => ok({ detail: "Password reset email sent in mock mode" }));

  mock.onGet(/\/api\/v1\/user-types\/?$/).reply(() =>
    ok([
      { key: "student", name: "Student", description: "Student account" },
      {
        key: "organisation",
        name: "Organisation",
        description: "Organisation account",
      },
    ])
  );

  mock.onGet(/\/api\/v1\/user-types\/[^/]+\/onboarding-pages\/?$/).reply(() =>
    ok({
      onboarding_pages: {
        schema_version: "mock",
        student_onboarding: [],
        organisation_onboarding: [],
        organisation_member_onboarding: [],
      },
    })
  );

  mock.onGet(/\/api\/v2\/users\/me\/?$/).reply(() => ok(getActiveUserDetails()));
  mock.onPatch(/\/api\/v2\/users\/me\/?$/).reply((config) =>
    ok({
      ...getActiveUserDetails(),
      ...body(config),
    })
  );

  mock
    .onGet(/\/api\/v2\/profiles\/student\/me\/?$/)
    .reply(() => ok(mockStudentProfile));
  mock.onPatch(/\/api\/v2\/profiles\/student\/me\/?$/).reply((config) =>
    ok({
      ...mockStudentProfile,
      ...body(config),
    })
  );
  mock
    .onPost(/\/api\/v2\/profiles\/student\/me\/resume\/?$/)
    .reply(() => ok({ resume_url: "/mock/resume.pdf" }));
  mock
    .onDelete(/\/api\/v2\/profiles\/student\/me\/resume\/?$/)
    .reply(() => ok({ resume_url: null }));
  mock
    .onPost(/\/api\/v2\/ui\/student\/([^/]+)\/card\/?$/)
    .reply((config) => {
      const id = config.url?.match(/student\/([^/]+)\/card/)?.[1];
      return ok(
        mockStudents.find((student) => String(student.id) === id) ??
          mockStudentProfile
      );
    });

  mock
    .onGet(/\/api\/v2\/profiles\/organisation\/invite\/?$/)
    .reply(() => noContent());
  mock
    .onPost(/\/api\/v2\/profiles\/organisation\/invite\/accept\/?$/)
    .reply(() => ok({ detail: "Invite accepted" }));
  mock
    .onPost(/\/api\/v2\/profiles\/organisation\/invite\/decline\/?$/)
    .reply(() => ok({ detail: "Invite declined" }));
  mock
    .onGet(/\/api\/v2\/profiles\/organisation\/member\/me\/?$/)
    .reply(() => ok(mockOrganisationMember));
  mock
    .onPatch(/\/api\/v2\/profiles\/organisation\/member\/me\/?$/)
    .reply((config) => ok({ ...mockOrganisationMember, ...body(config) }));
  mock
    .onGet(/\/api\/v2\/profiles\/organisation\/me\/?$/)
    .reply(() => ok(mockOrganisation));
  mock
    .onPost(/\/api\/v2\/profiles\/organisation\/me\/?$/)
    .reply((config) => created({ ...mockOrganisation, ...body(config) }));
  mock
    .onPatch(/\/api\/v2\/profiles\/organisation\/me\/?$/)
    .reply((config) => ok({ ...mockOrganisation, ...body(config) }));
  mock
    .onPost(/\/api\/v2\/profiles\/organisation\/me\/logo\/?$/)
    .reply(() => ok({ logo_url: mockOrganisation.logo_url }));
  mock
    .onDelete(/\/api\/v2\/profiles\/organisation\/me\/logo\/?$/)
    .reply(() => ok({ logo_url: null }));
  mock
    .onGet(/\/api\/v2\/profiles\/organisation\/members\/?$/)
    .reply(() => ok(paginated(mockOrganisationMembers)));
  mock.onGet(/\/api\/v2\/profiles\/organisation\/invites\/?$/).reply(() =>
    ok(
      paginated([
        {
          id: 601,
          email: "new.member@example.com",
          platform_role: "member",
          status: "pending",
          invited_at: "2026-08-20T09:00:00Z",
          expires_at: "2026-09-03T09:00:00Z",
        },
      ])
    )
  );
  mock
    .onPost(/\/api\/v2\/profiles\/organisation\/invite\/?$/)
    .reply((config) =>
      created({
        id: Math.floor(Math.random() * 10000),
        ...body(config),
        status: "pending",
      })
    );
  mock
    .onPost(/\/api\/v2\/profiles\/organisation\/invite\/[^/]+\/revoke\/?$/)
    .reply(() => ok({ detail: "Invite revoked" }));
  mock
    .onPatch(/\/api\/v2\/profiles\/organisation\/member\/[^/]+\/?$/)
    .reply((config) => ok({ ...mockOrganisationMember, ...body(config) }));
  mock
    .onDelete(/\/api\/v2\/profiles\/organisation\/member\/[^/]+\/?$/)
    .reply(() => noContent());
  mock
    .onPost(/\/api\/v2\/ui\/organisation\/([^/]+)\/card\/?$/)
    .reply((config) => {
      const id = config.url?.match(/organisation\/([^/]+)\/card/)?.[1];
      return ok(
        mockOrganisations.find((org) => String(org.id) === id) ??
          mockOrganisations[0]
      );
    });

  mock.onPost(/\/api\/v2\/generic\/geocode\/search\/?$/).reply((config) => {
    const payload = body(config);
    const address = String(payload.address ?? "Parkville VIC, Australia");
    return ok([
      {
        id: 1,
        formatted_address: address,
        latitude: "-37.7983",
        longitude: "144.9609",
        locality: "Parkville",
        country: "Australia",
      },
    ]);
  });
  mock
    .onPost(/\/api\/v2\/generic\/abn\/validate\/?$/)
    .reply(() => ok({ valid: true, matchedName: mockOrganisation.name }));

  mock.onGet(/\/api\/v2\/taxonomy\/?$/).reply((config) => {
    const query = params(config);
    const nodes = mockTaxonomyNodes.filter((node) => {
      if (query.type && node.type !== query.type) return false;
      if (query.parent && node.parent !== query.parent) return false;
      return true;
    });
    return ok(nodes);
  });

  mock.onGet(/\/api\/v2\/ui\/homepage\/?$/).reply(() => ok(getHomepageData()));

  mock
    .onGet(/\/api\/v2\/opportunities\/all\/?$/)
    .reply(() => ok({ opportunities: mockOpportunities }));
  mock
    .onGet(/\/api\/v2\/opportunities\/coordinator\/all\/?$/)
    .reply(() => ok(mockOpportunities));
  mock.onGet(/\/api\/v1\/opportunities\/([^/]+)\/?$/).reply((config) => {
    const idOrSlug = config.url?.match(/opportunities\/([^/]+)\/?$/)?.[1] ?? "1";
    const opportunity = getOpportunity(idOrSlug);
    return opportunity ? ok(opportunity) : [404, { detail: "Not found" }];
  });
  mock
    .onGet(/\/api\/v2\/opportunities\/[^/]+\/participant\/?$/)
    .reply(() => ok(activeParticipant()));
  mock
    .onPatch(/\/api\/v2\/opportunities\/[^/]+\/participant\/?$/)
    .reply((config) => ok({ ...activeParticipant(), ...body(config) }));
  mock
    .onPost(/\/api\/v2\/opportunities\/[^/]+\/participant\/?$/)
    .reply(() => created(activeParticipant()));
  mock
    .onDelete(/\/api\/v2\/opportunities\/[^/]+\/participant\/?$/)
    .reply(() => noContent());
  mock
    .onPost(/\/api\/v2\/opportunities\/[^/]+\/set-default\/?$/)
    .reply((config) => {
      const id = findOpportunityIdFromUrl(config.url);
      mockOpportunities.forEach((opportunity) => {
        opportunity.is_default = String(opportunity.id) === id;
      });
      return ok({ detail: "Default opportunity set" });
    });
  mock
    .onDelete(/\/api\/v2\/opportunities\/[^/]+\/set-default\/?$/)
    .reply(() => {
      mockOpportunities.forEach((opportunity) => {
        opportunity.is_default = false;
      });
      return noContent();
    });
  mock
    .onGet(/\/api\/v2\/opportunities\/coordinator\/[^/]+\/dashboard\/?$/)
    .reply(() =>
      ok({
        students: { invited: 42, accepted: 28, messaged: 16, matched: 8 },
        organisations: { invited: 18, accepted: 12, messaged: 9, matched: 8 },
      })
    );
  mock
    .onGet(/\/api\/v2\/opportunities\/coordinator\/[^/]+\/participants\/?$/)
    .reply(() =>
      ok(
        paginated([
          {
            id: 1001,
            name: "Mia Chen",
            email: "student@mock.local",
            profile_id: 101,
            user_type: "student",
            accepted_status: "accepted",
            invitation_sent_at: "2026-08-20T09:00:00Z",
            has_profile: true,
            hidden: false,
            match_info: {
              is_matched: true,
              matched_with: {
                id: 2001,
                name: "Northside Learning Collective",
                user_type: "organisation",
                matched_at: "2026-08-22T09:00:00Z",
                match_id: 3001,
              },
            },
          },
          {
            id: 2001,
            name: "Northside Learning Collective",
            email: "placements@northside.example",
            profile_id: 201,
            user_type: "organisation",
            accepted_status: "accepted",
            invitation_sent_at: "2026-08-20T09:00:00Z",
            has_profile: true,
            hidden: false,
          },
        ])
      )
    );
  mock
    .onPatch(
      /\/api\/v2\/opportunities\/coordinator\/[^/]+\/participants\/[^/]+\/?$/
    )
    .reply((config) => ok({ hidden: Boolean(body(config).hidden) }));
  mock
    .onDelete(
      /\/api\/v2\/opportunities\/coordinator\/[^/]+\/participants\/[^/]+\/?$/
    )
    .reply(() => noContent());
  mock
    .onPost(/\/api\/v1\/opportunities\/[^/]+\/match\/?$/)
    .reply(() => created({ id: 3001, detail: "Mock match created" }));
  mock
    .onDelete(/\/api\/v1\/opportunities\/[^/]+\/match\/[^/]+\/?$/)
    .reply(() => noContent());
  mock
    .onPost(/\/api\/v2\/opportunities\/coordinator\/[^/]+\/invite\/[^/]+\/preview\/?$/)
    .reply(() =>
      ok({
        subject: "Invitation to join UniConnected prototype",
        body: "Hi, we would like to invite you to the prototype opportunity.",
        rendered_html:
          "<p>Hi, we would like to invite you to the prototype opportunity.</p>",
        message: "Preview generated in mock mode",
      })
    );
  mock
    .onPost(/\/api\/v2\/opportunities\/coordinator\/[^/]+\/invite\/[^/]+\/?$/)
    .reply(() =>
      created({
        detail: "Mock invitations queued",
        sent: 2,
        failed: [],
      })
    );

  mock.onPost(/\/api\/v2\/opportunities\/[^/]+\/participants\/facets\/?$/).reply(
    () =>
      ok({
        facets: {
          onboarding: {
            skills: {
              label: "Skills",
              key: "skills",
              kind: "array",
              options: [
                { value: "Lesson planning", label: "Lesson planning", count: 9 },
                { value: "Tutoring", label: "Tutoring", count: 7 },
                { value: "Data analysis", label: "Data analysis", count: 4 },
              ],
            },
          },
          questionnaire: {
            matched: {
              label: "Matched",
              key: "matched",
              kind: "boolean",
              options: [
                { value: "true", label: "Matched", count: 2 },
                { value: "false", label: "Not matched", count: 1 },
              ],
            },
          },
        },
      })
  );
  mock.onPost(/\/api\/v2\/opportunities\/[^/]+\/participants\/search\/?$/).reply(
    (config) => {
      const payload = body(config);
      const participantType = String(payload.participant_type ?? "student");
      const results =
        participantType === "organisation" ? mockOrganisations : mockStudents;
      return ok({
        results,
        page: {
          count: results.length,
          next: null,
          previous: null,
        },
      });
    }
  );

  mock
    .onGet(/\/api\/v2\/opportunities\/folders\/?$/)
    .reply(() => ok(mockFolders));
  mock
    .onPost(/\/api\/v2\/opportunities\/folders\/?$/)
    .reply((config) => {
      const payload = body(config) as { name?: string; description?: string };
      const folder = {
        id: Math.floor(Math.random() * 10000),
        name: payload.name ?? "Prototype folder",
        description: payload.description ?? null,
        member_count: 0,
        member_avatars: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockFolders.push(folder);
      return created(folder);
    });
  mock.onGet(/\/api\/v2\/opportunities\/folders\/([^/]+)\/?$/).reply((config) => {
    const id = config.url?.match(/folders\/([^/]+)\/?$/)?.[1] ?? "";
    const folder = folderDetail(id);
    return folder ? ok(folder) : [404, { detail: "Folder not found" }];
  });
  mock.onPut(/\/api\/v2\/opportunities\/folders\/([^/]+)\/?$/).reply((config) => {
    const id = config.url?.match(/folders\/([^/]+)\/?$/)?.[1] ?? "";
    const folder = mockFolders.find((item) => String(item.id) === id);
    if (!folder) return [404, { detail: "Folder not found" }];
    Object.assign(folder, body(config), { updated_at: new Date().toISOString() });
    return ok(folder);
  });
  mock
    .onDelete(/\/api\/v2\/opportunities\/folders\/([^/]+)\/?$/)
    .reply((config) => {
      const id = config.url?.match(/folders\/([^/]+)\/?$/)?.[1] ?? "";
      const index = mockFolders.findIndex((item) => String(item.id) === id);
      if (index >= 0) mockFolders.splice(index, 1);
      return noContent();
    });
  mock
    .onPost(/\/api\/v2\/opportunities\/folders\/[^/]+\/member\/?$/)
    .reply(() =>
      created({
        detail: "Added to folder",
        member: mockFolderMembers[0],
        member_count: mockFolderMembers.length,
      })
    );
  mock
    .onPost(/\/api\/v2\/opportunities\/folders\/[^/]+\/member\/remove\/?$/)
    .reply(() => noContent());

  mock.onGet(/\/api\/v1\/subscriptions\/product-pricing\/?$/).reply(() =>
    ok({
      products: [
        {
          id: "prod_mock_employment",
          name: "Employment Access",
          description: "Prototype subscription product.",
          default_price_id: "price_mock_yearly",
          prices: [
            {
              price_id: "price_mock_yearly",
              nickname: "Yearly Billing",
              unit_amount: 250000,
              currency: "aud",
              interval: "year",
              interval_count: 1,
            },
          ],
          metadata: { opportunity_slug: "employment" },
          marketing_features: ["View student profiles", "Send messages"],
        },
      ],
    })
  );
  mock
    .onPost(/\/api\/v1\/subscriptions\/checkout-session\/?$/)
    .reply(() => ok({ url: "/billing/success", session_id: "cs_mock" }));
  mock
    .onPost(/\/api\/v1\/subscriptions\/cancel\/?$/)
    .reply(() => ok({ detail: "Subscription cancelled in mock mode" }));

  mock.onGet(/\/api\/v1\/messaging\/conversations\/?$/).reply(() =>
    ok({
      next: null,
      previous: null,
      results: mockConversations,
    })
  );
  mock
    .onGet(/\/api\/v1\/messaging\/conversations\/([^/]+)\/messages\/?$/)
    .reply((config) => {
      const id = Number(config.url?.match(/conversations\/([^/]+)\//)?.[1]);
      return ok({
        next: null,
        previous: null,
        results: mockMessagesByConversation[id] ?? [],
      });
    });
  mock
    .onPost(/\/api\/v1\/messaging\/conversations\/get-or-create\/?$/)
    .reply(() => ok({ id: mockConversations[0].id }));
  mock
    .onPost(/\/api\/v1\/messaging\/conversations\/([^/]+)\/messages\/?$/)
    .reply((config) => {
      const id = Number(config.url?.match(/conversations\/([^/]+)\//)?.[1]);
      const payload = body(config) as { content?: string };
      const message = {
        id: Date.now(),
        sender: {
          id: Number(getActiveUser().id),
          email: getActiveUser().email ?? "mock@local",
          full_name: `${getActiveUser().first_name ?? ""} ${
            getActiveUser().last_name ?? ""
          }`.trim(),
          user_types: getActiveUser().user_types,
          profile_picture_url: getActiveUser().profile_picture_url ?? null,
          organisation_name: mockOrganisation.name ?? null,
          organisation_logo_url: mockOrganisation.logo_url ?? null,
          organisation_id: mockOrganisation.id ?? null,
        },
        content: payload.content ?? "",
        created_at: new Date().toISOString(),
        is_soft_deleted: false,
        attachments: [],
        is_edited: false,
        edited_at: null,
      };
      mockMessagesByConversation[id] = [
        ...(mockMessagesByConversation[id] ?? []),
        message,
      ];
      return created(message);
    });
  mock
    .onPatch(/\/api\/v1\/messaging\/conversations\/([^/]+)\/state\/?$/)
    .reply((config) => ok({ id: config.url, ...body(config) }));
  mock
    .onPost(/\/api\/v1\/messaging\/conversations\/([^/]+)\/read\/?$/)
    .reply(() => ok({ detail: "Read" }));

  mock
    .onAny()
    .reply((config) => {
      const method = config.method?.toUpperCase() ?? "REQUEST";
      console.warn(`[mock-api] No mock handler for ${method} ${config.url}`);
      if (config.method && ["post", "patch", "put", "delete"].includes(config.method)) {
        return ok({ detail: "Generic mock success" });
      }
      return [404, { detail: `No mock handler for ${method} ${config.url}` }];
    });

  console.info("[mock-api] UniConnected mock API enabled");
}

// mocks/handlers.ts
import { http, HttpResponse } from "msw";

// Hard-coded base URL to ensure MSW can intercept correctly
const BASE_URL = "http://localhost:8000";

export const handlers = [
  /**
   * Get product pricing
   * GET /subscription/api/v1/product-pricing/?opportunity_id=ID&user_type=SLUG
   */
  http.get(
    `${BASE_URL}/subscription/api/v1/product-pricing/`,
    ({ request }) => {
      const url = new URL(request.url);
      const opportunityId = url.searchParams.get("opportunity_id");
      const userType = url.searchParams.get("user_type");

      console.log(
        `[MSW] 📊 Product Pricing Request → Opportunity: ${opportunityId}, User Type: ${userType}`
      );

      // Opportunity ID "8" returns 404 (free opportunity)
      if (opportunityId === "8") {
        console.log("[MSW] ✅ Returning 404 - Free opportunity");
        return HttpResponse.json(
          { detail: "No pricing found for this opportunity" },
          { status: 404 }
        );
      }

      // Return pricing tiers with correct structure
      const response = {
        opportunity_id: Number(opportunityId),
        user_type: userType,
        prices: [
          {
            id: "price_monthly_001",
            price: 1900, // Price in cents ($19.00)
            currency: "USD",
            interval: "month",
            description: "Monthly subscription with full access",
            trial_days: 7,
          },
          {
            id: "price_yearly_001",
            price: 19900, // Price in cents ($199.00)
            currency: "USD",
            interval: "year",
            description: "Yearly subscription - Save 17%",
            trial_days: 14,
          },
        ],
      };

      console.log("[MSW] ✅ Returning pricing:", response);
      return HttpResponse.json(response);
    }
  ),

  /**
   * Create a checkout session
   * POST /subscription/api/v1/checkout-session/
   */
  http.post(
    `${BASE_URL}/subscription/api/v1/checkout-session/`,
    async ({ request }) => {
      const body = (await request.json()) as any;
      console.log("[MSW] 💳 Checkout Session Request:", body);

      // Simulate delay for realistic behavior
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use participant_id from request body
      // For enrolled users: frontend provides participant_id
      // For not enrolled users: frontend doesn't provide participant_id
      // In real scenario, participant_id is created after questionnaire completion
      const participantId = body.opportunity_participant_id;

      if (!participantId) {
        // For not enrolled users, don't create participant_id here
        // It will be created after questionnaire completion
        console.log(
          `[MSW] 🔄 Not enrolled user - participant_id will be created after questionnaire`
        );
      }

      // Store checkout data in sessionStorage for later retrieval
      const sessionId = `cs_test_${Date.now()}`;
      const checkoutData = {
        session_id: sessionId,
        opportunity_id: body.opportunity_id,
        participant_id: participantId,
        interval: body.interval,
        user_type: body.user_type,
      };

      sessionStorage.setItem(
        "mock_checkout_session",
        JSON.stringify(checkoutData)
      );

      // For enrolled users: Update subscription status to active
      // For not enrolled users: Status will be created after questionnaire completion
      if (participantId) {
        const newSubscriptionStatus = {
          opportunity_participant_id: participantId,
          status: "active", // Update from canceled/expired to active
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 days from now
          cancel_at_period_end: false,
        };

        // Store the updated subscription status
        sessionStorage.setItem(
          `subscription_status_${participantId}`,
          JSON.stringify(newSubscriptionStatus)
        );

        console.log(
          `[MSW] 🔄 Updated subscription status for enrolled user: ${participantId}`
        );
      } else {
        console.log(
          `[MSW] 🔄 Not enrolled user - subscription status will be created after questionnaire`
        );
      }

      // In real scenario, this would redirect to Stripe
      // For testing, only redirect to a local success page
      const successUrl = `${window.location.origin}/billing/success?session_id=${sessionId}`;

      return HttpResponse.json({
        url: successUrl,
        session_id: sessionId,
      });
    }
  ),

  /**
   * Simulate subscription status
   * GET /subscription/api/v1/status/?opportunity_participant_id=ID
   */
  http.get(`${BASE_URL}/subscription/api/v1/status/`, ({ request }) => {
    const url = new URL(request.url);
    const participantId = url.searchParams.get("opportunity_participant_id");

    console.log(
      `[MSW] 📈 Subscription Status Request → Participant: ${participantId}`
    );

    // Debug: List all subscription status keys in sessionStorage
    const allKeys = Object.keys(sessionStorage).filter((key) =>
      key.startsWith("subscription_status_")
    );
    console.log(
      `[MSW] 🔍 All subscription status keys in sessionStorage:`,
      allKeys
    );

    // No participant ID - return 404
    if (!participantId) {
      console.log("[MSW] ❌ No participant ID provided");
      return HttpResponse.json(
        { detail: "Participant ID required" },
        { status: 400 }
      );
    }

    // Check if there's an updated subscription status from checkout
    const statusKey = `subscription_status_${participantId}`;
    const updatedStatus = sessionStorage.getItem(statusKey);

    if (updatedStatus) {
      return HttpResponse.json(JSON.parse(updatedStatus));
    } else {
      console.log("[MSW] ❌ No updated status found, using statusMap");
    }

    // Use participant ID to determine status (for predictable testing)
    // Test different scenarios by using different participant IDs
    const statusMap: Record<string, any> = {
      // Participant ID "1" - Active subscription
      "1": {
        opportunity_participant_id: 1,
        status: "active",
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days from now
        cancel_at_period_end: false,
      },
      // Participant ID "2" - Trialing (treated as active)
      "2": {
        opportunity_participant_id: 2,
        status: "trialing",
        current_period_end: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days from now
        cancel_at_period_end: false,
      },
      // Participant ID "3" - Canceled but still valid
      "92": {
        opportunity_participant_id: 92,
        status: "canceled",
        current_period_end: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(), // 5 days from now
        cancel_at_period_end: true,
      },
      // Participant ID "4" - Expired
      "93": {
        opportunity_participant_id: 93,
        status: "expired",
        current_period_end: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(), // 10 days ago
        cancel_at_period_end: true,
      },
      // Participant ID "5" - Past due
      "5": {
        opportunity_participant_id: 5,
        status: "past_due",
        current_period_end: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancel_at_period_end: false,
      },
      // Custom: Opportunity 7
      "7": {
        opportunity_participant_id: 7,
        status: "past_due",
        current_period_end: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancel_at_period_end: true,
      },
    };

    // Use predefined status if exists, otherwise default to active
    const response = statusMap[participantId] || {
      // Default: Active subscription for any other ID
      opportunity_participant_id: Number(participantId),
      status: "active",
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      cancel_at_period_end: false,
    };

    return HttpResponse.json(response);
  }),
];

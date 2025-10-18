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

      // Opportunity ID "5" returns 404 (free opportunity)
      if (opportunityId === "5") {
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

      // Generate a mock participant ID based on opportunity_id
      // This simulates what the backend would do when creating an enrollment
      const participantId = `${body.opportunity_id}01`; // e.g., opportunity 6 -> participant 601

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

      // Also store the participant ID for the opportunity
      sessionStorage.setItem(
        `opportunity_participant_${body.opportunity_id}`,
        participantId
      );

      // In real scenario, this would redirect to Stripe
      // For testing, we'll redirect to a local success page
      const successUrl = `${window.location.origin}/billing/success?session_id=${sessionId}`;

      console.log("[MSW] ✅ Checkout session created:", sessionId);
      console.log("[MSW] 🎯 Generated participant ID:", participantId);
      console.log(
        "[MSW] 💾 Stored participant ID for opportunity:",
        body.opportunity_id
      );
      console.log("[MSW] 🔗 Redirect URL:", successUrl);

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

    // No participant ID - return 404
    if (!participantId) {
      console.log("[MSW] ❌ No participant ID provided");
      return HttpResponse.json(
        { detail: "Participant ID required" },
        { status: 400 }
      );
    }

    // Participant ID ending in "99" (from opportunity 999) - return 404 (free opportunity)
    if (participantId.endsWith("99")) {
      console.log("[MSW] ✅ Free opportunity - returning 404");
      return HttpResponse.json(
        { detail: "No subscription required" },
        { status: 404 }
      );
    }

    // Use participant ID to determine status (for predictable testing)
    // This allows you to test different scenarios by using different participant IDs
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
      // Participant ID "2" - Trialing
      "2": {
        opportunity_participant_id: 2,
        status: "trialing",
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        current_period_end: new Date(
          Date.now() + 37 * 24 * 60 * 60 * 1000
        ).toISOString(),
        cancel_at_period_end: false,
      },
      // Participant ID "3" - Canceled but still valid
      "3": {
        opportunity_participant_id: 3,
        status: "canceled",
        current_period_end: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(), // 5 days from now
        cancel_at_period_end: true,
      },
      // Participant ID "4" - Expired
      "4": {
        opportunity_participant_id: 4,
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
      // Custom: Opportunity 83
      "83": {
        opportunity_participant_id: 83,
        status: "trialing",
        trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        current_period_end: new Date(
          Date.now() + 37 * 24 * 60 * 60 * 1000
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

    // Check if subscription was cancelled in this session
    const cancellationKey = `subscription_cancelled_${participantId}`;
    const isCancelled = sessionStorage.getItem(cancellationKey) === "true";

    // Use predefined status if exists, otherwise default to active
    let response = statusMap[participantId] || {
      // Default: Active subscription for any other ID
      opportunity_participant_id: Number(participantId),
      status: "active",
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      cancel_at_period_end: false,
    };

    // If subscription was cancelled in this session, update the status
    if (
      isCancelled &&
      (response.status === "active" || response.status === "trialing")
    ) {
      response = {
        ...response,
        status: "canceled",
        cancel_at_period_end: true,
      };
      console.log(
        "[MSW] 🔄 Updated status to cancelled for participant:",
        participantId
      );
    }

    console.log(
      "[MSW] ✅ Subscription status for participant",
      participantId,
      ":",
      response
    );

    // Wrap response in subscription object to match expected format
    return HttpResponse.json({
      subscription: response,
    });
  }),

  /**
   * Cancel subscription
   * POST /subscription/api/v1/cancel/
   */
  http.post(`${BASE_URL}/subscription/api/v1/cancel/`, async ({ request }) => {
    const body = (await request.json()) as any;
    console.log("[MSW] 🚫 Cancel Subscription Request:", body);

    // Simulate delay for realistic behavior
    await new Promise((resolve) => setTimeout(resolve, 300));

    const participantId = body.opportunity_participant_id;

    if (!participantId) {
      console.log("[MSW] ❌ No participant ID provided");
      return HttpResponse.json(
        { detail: "Participant ID required" },
        { status: 400 }
      );
    }

    // Store cancellation in sessionStorage to simulate backend state change
    const cancellationKey = `subscription_cancelled_${participantId}`;
    sessionStorage.setItem(cancellationKey, "true");

    console.log(
      "[MSW] ✅ Subscription cancelled for participant:",
      participantId
    );

    return HttpResponse.json({
      success: true,
      message: "Subscription cancelled successfully",
      opportunity_participant_id: participantId,
      cancel_at_period_end: true,
    });
  }),
];

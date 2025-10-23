"use client";
import React from "react";
import {
  Box,
  Badge,
  Text,
  Button,
  useDisclosure,
  createToaster,
} from "@chakra-ui/react";
import {
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@chakra-ui/react";
import {
  SubscriptionInfo,
  SubscriptionStatus,
  SubscriptionStatusResponse,
} from "@/types/opportunities";
import { useCancelSubscription } from "@/services/subscription";
import { formatDate } from "@/utils/formatDate";

interface SubscriptionStatusProps {
  subscription: SubscriptionStatusResponse;
  opportunityParticipantId: number;
  onStatusUpdate?: () => void;
}

const SubscriptionStatusComponent: React.FC<SubscriptionStatusProps> = ({
  subscription,
  opportunityParticipantId,
  onStatusUpdate,
}) => {
  const { open, onOpen, onClose } = useDisclosure();
  const cancelSubscriptionMutation = useCancelSubscription();
  const toaster = createToaster({ placement: "top" });

  const getStatusDisplay = (status: SubscriptionStatus) => {
    switch (status) {
      case "incomplete":
        return {
          color: "orange",
          icon: "🟠",
          text: "Incomplete",
        };
      case "incomplete_expired":
        return {
          color: "red",
          icon: "🔴",
          text: "Incomplete Expired",
        };
      case "trialing":
        return {
          color: "yellow",
          icon: "🟡",
          text: "Trial",
        };
      case "active":
        return {
          color: "green",
          icon: "🟢",
          text: "Active",
        };
      case "past_due":
        return {
          color: "orange",
          icon: "🟠",
          text: "Past Due",
        };
      case "canceled":
        return {
          color: "red",
          icon: "🔴",
          text: "Canceled",
        };
      case "unpaid":
        return {
          color: "red",
          icon: "🔴",
          text: "Unpaid",
        };
      case "paused":
        return {
          color: "gray",
          icon: "⚫",
          text: "Paused",
        };
      case "no_subscription":
        return {
          color: "gray",
          icon: "⚫",
          text: "No Subscription",
        };
      default:
        return {
          color: "gray",
          icon: "⚫",
          text: "Unknown",
        };
    }
  };

  const getStatusMessage = (subscription: SubscriptionStatusResponse) => {
    const { status, current_period_end, cancel_at_period_end } = subscription;
    const endDate = formatDate(current_period_end);

    // Handle cancellation case first
    if (
      cancel_at_period_end &&
      (status === "active" || status === "trialing")
    ) {
      return `Canceled — access until ${endDate}`;
    }

    switch (status) {
      case "incomplete":
        return `Incomplete — please complete payment`;
      case "incomplete_expired":
        return `Incomplete expired — please resubscribe`;
      case "trialing":
        return `Trial ends on ${endDate}`;
      case "active":
        return `Active — renews on ${endDate}`;
      case "past_due":
        return `Past due — please update payment method`;
      case "canceled":
        return `Canceled — access until ${endDate}`;
      case "unpaid":
        return `Unpaid — please update payment method`;
      case "paused":
        return `Paused — subscription is paused`;
      case "no_subscription":
        return `No active subscription`;
      default:
        return `Status: ${status}`;
    }
  };

  const canCancel = (status: SubscriptionStatus) => {
    // Don't show cancel button if already set to cancel at period end
    if (subscription.cancel_at_period_end) {
      return false;
    }
    return status === "active" || status === "trialing";
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscriptionMutation.mutateAsync(opportunityParticipantId);

      toaster.create({
        title: "Subscription canceled",
        description: `Your access will continue until ${formatDate(subscription.current_period_end)}.`,
        type: "success",
        duration: 5000,
      });

      onClose();
      onStatusUpdate?.();
    } catch (error: any) {
      console.error("Cancel subscription failed:", error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to cancel subscription";

      toaster.create({
        title: "Error",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    }
  };

  // Override status display if subscription is set to cancel
  const effectiveStatus =
    subscription.cancel_at_period_end &&
    (subscription.status === "active" || subscription.status === "trialing")
      ? "canceled"
      : subscription.status;

  const statusDisplay = getStatusDisplay(effectiveStatus);
  const statusMessage = getStatusMessage(subscription);

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Text fontSize="sm" color="gray.600">
          {statusDisplay.icon} {statusMessage}
        </Text>
        <Badge colorScheme={statusDisplay.color} size="sm">
          {statusDisplay.text}
        </Badge>
      </Box>

      {canCancel(effectiveStatus) && (
        <Button
          size="sm"
          variant="outline"
          colorScheme="red"
          onClick={onOpen}
          loading={cancelSubscriptionMutation.isPending}
        >
          Cancel Subscription
        </Button>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={open} onOpenChange={(details) => onClose()}>
        <DialogBackdrop
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          }}
        />
        <DialogContent
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            maxWidth: "500px",
            width: "90%",
            maxHeight: "90vh",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            padding: "0",
          }}
        >
          <DialogHeader
            style={{
              padding: "24px 24px 0 24px",
              fontSize: "20px",
              fontWeight: "600",
              color: "#1F2937",
            }}
          >
            Cancel Subscription
          </DialogHeader>
          <DialogBody
            style={{
              padding: "16px 24px",
              fontSize: "16px",
              color: "#6B7280",
              lineHeight: "1.5",
            }}
          >
            <Text>
              Your access will continue until{" "}
              {formatDate(subscription.current_period_end)}. After that
              you&apos;ll be unenrolled automatically.
            </Text>
          </DialogBody>
          <DialogFooter
            style={{
              padding: "0 24px 24px 24px",
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="ghost"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
              }}
            >
              Keep Subscription
            </Button>
            <Button
              colorScheme="red"
              onClick={handleCancelSubscription}
              loading={cancelSubscriptionMutation.isPending}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
              }}
            >
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SubscriptionStatusComponent;

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
import { AccessInfo, SubscriptionInfo } from "@/types/opportunities";
import { useCancelSubscription } from "@/services/subscription";
import { formatDate } from "@/utils/formatDate";

interface SubscriptionStatusProps {
  accessInfo: AccessInfo;
  opportunityId: number;
  onStatusUpdate?: () => void;
}

const SubscriptionStatusComponent: React.FC<SubscriptionStatusProps> = ({
  accessInfo,
  opportunityId,
  onStatusUpdate,
}) => {
  const { open, onOpen, onClose } = useDisclosure();
  const cancelSubscriptionMutation = useCancelSubscription();
  const toaster = createToaster({ placement: "top" });

  const subscription = accessInfo.subscription || undefined;

  const getStatusDisplay = (info: AccessInfo) => {
    if (info.active_override) {
      return {
        color: "green",
        icon: "🟢",
        text: "Access Override",
      };
    }
    if (info.subscription) {
      switch (info.subscription.status) {
        case "incomplete":
          return { color: "orange", icon: "🟠", text: "Incomplete" };
        case "incomplete_expired":
          return { color: "red", icon: "🔴", text: "Incomplete Expired" };
        case "trialing":
          return { color: "yellow", icon: "🟢", text: "Trial" };
        case "active":
          return { color: "green", icon: "🟢", text: "Active" };
        case "past_due":
          return { color: "orange", icon: "🟠", text: "Past Due" };
        case "canceled":
          return { color: "red", icon: "🔴", text: "Canceled" };
        case "unpaid":
          return { color: "red", icon: "🔴", text: "Unpaid" };
        case "paused":
          return { color: "gray", icon: "⚫", text: "Paused" };
        default:
          return { color: "gray", icon: "⚫", text: "Unknown" };
      }
    }
    if (info.has_access === true) {
      return { color: "green", icon: "🟢", text: "Access Granted" };
    }
    return { color: "red", icon: "🔴", text: "No Access" };
  };

  const getStatusMessage = (info: AccessInfo) => {
    if (info.active_override) {
      return `Access granted until ${formatDate(
        info.active_override.end
      )}\nReason: ${info.active_override.reason}`;
    }

    if (!info.subscription) {
      if (info.has_access) {
        return "Access is currently granted.";
      }
      return "You don't have access.";
    }

    const { status, current_period_end, cancel_at_period_end } =
      info.subscription;
    const endDate = current_period_end ? formatDate(current_period_end) : "";

    if (
      cancel_at_period_end &&
      (status === "active" || status === "trialing")
    ) {
      return `Canceled. You have access until ${endDate}`;
    }

    switch (status) {
      case "incomplete":
        return "Incomplete, please complete payment.";
      case "incomplete_expired":
        return "Incomplete expired, please resubscribe.";
      case "trialing":
        return endDate ? `Trial ends on ${endDate}` : "Trial is active.";
      case "active":
        return endDate ? `Active, renews on ${endDate}` : "Active.";
      case "past_due":
        return "Past due, please update payment method.";
      case "canceled":
        return endDate ? `Canceled, access until ${endDate}` : "Canceled.";
      case "unpaid":
        return "Unpaid, please update payment method.";
      case "paused":
        return "Paused, subscription is paused.";
      default:
        return `Status: ${status}`;
    }
  };

  const canCancel = (sub?: SubscriptionInfo) => {
    if (!sub) return false;
    if (sub.cancel_at_period_end) return false;
    return sub.status === "active" || sub.status === "trialing";
  };

  const isTrialing = subscription?.status === "trialing";

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscriptionMutation.mutateAsync(opportunityId);

      toaster.create({
        title: "Subscription canceled",
        description: `Your access will continue until ${formatDate(
          accessInfo.entitlement_expires_at || ""
        )}.`,
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

  const statusDisplay = getStatusDisplay(accessInfo);
  const statusMessage = getStatusMessage(accessInfo);

  return (
    <Box>
      {/* Status badge on top */}
      <Box mb={2} ml={-1}>
        <Badge colorScheme={statusDisplay.color} mr={0} fontSize="sm">
          {statusDisplay.icon} {statusDisplay.text}
        </Badge>
      </Box>

      {/* Message under it */}
      <Text fontSize="sm" color="gray.600" whiteSpace="pre-line" mb={3}>
        {statusMessage}
      </Text>

      {/* Buttons */}
      {canCancel(subscription) && (
        <Box display="flex" gap={2}>
          <Button
            size="sm"
            bg={"red.500"}
            onClick={onOpen}
            loading={cancelSubscriptionMutation.isPending}
          >
            Cancel Subscription
          </Button>
        </Box>
      )}

      {/* Keep your original dialog positioning */}
      <Dialog
        open={open}
        onOpenChange={(details) => {
          if (!details.open) onClose();
        }}
      >
        <DialogBackdrop
          style={{
            position: "fixed",
            inset: 0,
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
            padding: 0,
          }}
        >
          <DialogHeader
            style={{
              padding: "24px 24px 0 24px",
              fontSize: "20px",
              fontWeight: 600,
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
              lineHeight: 1.5,
            }}
          >
            <Text>
              Your access will continue until{" "}
              {formatDate(accessInfo.entitlement_expires_at || "")}. After that
              you will loose access to the opportunity.
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
            <Button variant="ghost" onClick={onClose}>
              Keep Subscription
            </Button>
            <Button
              bg={"red.500"}
              onClick={handleCancelSubscription}
              loading={cancelSubscriptionMutation.isPending}
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

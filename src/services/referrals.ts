import { apiRequest } from "@/lib/api-client";

export type ReferralStatus =
  | "pending"
  | "signed_up"
  | "first_purchase"
  | "rewarded"
  | "expired";

export type ReferralRewardType = "wallet_credit" | "points";

export interface MyReferral {
  id: string;
  referrerCustomerId: string;
  referredCustomerId: string;
  referralCode: string;
  status: ReferralStatus;
  referrerReward: number;
  referredReward: number;
  rewardType: ReferralRewardType;
  signedUpAt: string | null;
  firstPurchaseAt: string | null;
  rewardedAt: string | null;
  expiresAt: string | null;
  referrerName: string | null;
  referredName: string | null;
  referredEmail: string | null;
  referredPhone: string | null;
  createdAt: string;
}

export interface MyReferralsSummary {
  referralCode: string;
  totalReferred: number;
  rewardedCount: number;
  pendingCount: number;
  totalRewardEarned: number;
  totalRewardPending: number;
  rewardType: ReferralRewardType;
  referrals: MyReferral[];
}

export const referralsApi = {
  mySummary(): Promise<MyReferralsSummary> {
    return apiRequest<MyReferralsSummary>("/storefront/me/referrals");
  },
};

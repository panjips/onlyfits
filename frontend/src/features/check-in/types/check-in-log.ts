export type CheckInType = "check-in" | "check-out";

export interface CheckInLogEntry {
  id: string;
  memberName: string;
  memberEmail: string;
  avatarUrl?: string;
  type: CheckInType;
  timestamp: Date;
  memberId: string;
}

export interface CheckInLogState {
  entries: CheckInLogEntry[];
  isLoading: boolean;
}

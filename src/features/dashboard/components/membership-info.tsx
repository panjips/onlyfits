import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Clock, Calendar, AlertTriangle } from "lucide-react";
import { useUser } from "@/provider/user-provider";

type MembershipStatus = "active" | "expired" | "pending" | "cancelled";

interface MembershipDisplayData {
  isMember: boolean;
  status?: MembershipStatus;
  expirationDate?: Date;
  startDate?: Date;
  daysLeft?: number;
}

const statusConfig: Record<
  MembershipStatus,
  { label: string; color: string; bgColor: string; icon: typeof Crown }
> = {
  active: {
    label: "Active",
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: Crown,
  },
  expired: {
    label: "Expired",
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: AlertTriangle,
  },
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: Clock,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/30",
    icon: AlertTriangle,
  },
};

const formatDate = (date: Date | string | undefined) => {
  if (!date) return "N/A";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const calculateDaysLeft = (endDate: Date | string | undefined): number => {
  if (!endDate) return 0;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const endClean = new Date(end);
  endClean.setHours(0, 0, 0, 0);
  
  const diffTime = endClean.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const MemberView = ({ data }: { data: MembershipDisplayData }) => {
  const status = data.status || "active";
  const config = statusConfig[status] || statusConfig.active;
  const IconComponent = config.icon;
  const daysLeft = data.daysLeft ?? 0;
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
  const isExpired = daysLeft < 0;

  return (
    <div className="border border-ld rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
        <h3 className="text-sm font-semibold text-foreground">Membership</h3>
        <Badge className={`${config.bgColor} ${config.color} border-0 text-xs`}>
          <IconComponent className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <div className="flex-1 grid grid-cols-2 divide-x divide-border">
        <div className="p-3 flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-lightprimary flex items-center justify-center mb-2">
            <Clock
              className={`w-4 h-4 ${
                isExpired
                  ? "text-error"
                  : isExpiringSoon
                  ? "text-warning"
                  : "text-primary"
              }`}
            />
          </div>
          <span
            className={`text-2xl font-bold ${
              isExpired
                ? "text-error"
                : isExpiringSoon
                ? "text-warning"
                : "text-foreground"
            }`}
          >
            {isExpired ? Math.abs(daysLeft) : daysLeft}
          </span>
          <span className="text-muted-foreground text-xs">
            {isExpired ? "Days Overdue" : "Days Left"}
          </span>
        </div>

        {/* Expiration Section */}
        <div className="p-3 flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-lightsecondary flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4 text-secondary" />
          </div>
          <span className="text-sm font-bold text-foreground">
            {formatDate(data.expirationDate)}
          </span>
          <span className="text-muted-foreground text-xs mt-1">
            {isExpired ? "Expired On" : "Expires On"}
          </span>
        </div>
      </div>
    </div>
  );
};

const NonMemberView = () => {
  return (
    <div className="border border-ld rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
        <h3 className="text-sm font-semibold text-foreground">Membership</h3>
        <Badge variant="secondary" className="text-muted-foreground text-xs">
          Inactive
        </Badge>
      </div>
      <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
        <Sparkles className="w-8 h-8 text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No active membership</p>
      </div>
    </div>
  );
};

export const MembershipInfo = () => {
  const { user } = useUser();

  const member = user?.member;
  const isMember = !!(
    member?.memberId &&
    member?.status &&
    member.status.toLowerCase() !== "cancelled"
  );

  if (!isMember || !member) {
    return <NonMemberView />;
  }

  const daysLeft = calculateDaysLeft(member.endDate);

  let displayStatus: MembershipStatus = "active";
  if (member.status) {
    const statusLower = member.status.toLowerCase();
    if (statusLower === "expired" || daysLeft < 0) {
      displayStatus = "expired";
    } else if (statusLower === "pending") {
      displayStatus = "pending";
    } else if (statusLower === "cancelled") {
      displayStatus = "cancelled";
    } else {
      displayStatus = "active";
    }
  }

  const membershipData: MembershipDisplayData = {
    isMember: true,
    status: displayStatus,
    expirationDate: member.endDate,
    startDate: member.startDate,
    daysLeft,
  };

  return <MemberView data={membershipData} />;
};

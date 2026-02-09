export type UserRole = "super_admin" | "admin" | "staff" | "member";

export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: string;
  children?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  isPro?: boolean;
  roles?: UserRole[];
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: string;
  id?: string | number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  isPro?: boolean;
  roles?: UserRole[];
}

const sidebarContent: MenuItem[] = [
  {
    heading: "Main",
    children: [
      {
        name: "Dashboard",
        icon: "solar:widget-2-linear",
        id: crypto.randomUUID(),
        url: "/dashboard",
        roles: ["super_admin", "admin", "staff", "member"],
      },
      {
        name: "Wellness",
        icon: "tabler:chart-line",
        id: crypto.randomUUID(),
        url: "/analyze",
        roles: ["member"],
      },
      {
        name: "Assistant",
        icon: "tabler:robot",
        id: crypto.randomUUID(),
        url: "/assistant",
        roles: ["member"],
      },
    ],
  },
  {
    heading: "Modules",
    roles: ["admin", "staff"],
    children: [
      {
        name: "Members",
        icon: "solar:users-group-rounded-linear",
        id: crypto.randomUUID(),
        url: "/members",
        children: [
          {
            /**
             * Admin = Organization locked
             * Staff = Organization and Branch locked
             */
            name: "All Members",
            id: crypto.randomUUID(),
            url: "/members",
            roles: ["admin", "staff"],
          },
          {
            name: "My Profile",
            id: crypto.randomUUID(),
            url: "/members/profile",
            roles: ["member"],
          },
        ],
      },
      {
        name: "Check-in",
        icon: "solar:qr-code-linear",
        id: crypto.randomUUID(),
        url: "/check-ins",
        children: [
          {
            name: "Scanner",
            id: crypto.randomUUID(),
            url: "/check-ins/scanner",
            roles: ["super_admin", "admin", "staff"],
          },
          {
            name: "Live Feed",
            id: crypto.randomUUID(),
            url: "/check-ins/live",
            roles: ["super_admin", "admin", "staff"],
          },
          {
            name: "My QR Code",
            id: crypto.randomUUID(),
            url: "/check-ins/qr",
            roles: ["member"],
          },
          {
            name: "History",
            id: crypto.randomUUID(),
            url: "/check-ins/history",
            roles: ["super_admin", "admin", "staff", "member"],
          },
        ],
      },
      {
        name: "Billing",
        icon: "solar:bill-list-linear",
        id: crypto.randomUUID(),
        url: "/billing",
        children: [
          {
            name: "Invoices",
            id: crypto.randomUUID(),
            url: "/billing/invoices",
            roles: ["super_admin", "admin", "staff", "member"],
          },
          {
            name: "Subscriptions",
            id: crypto.randomUUID(),
            url: "/billing/subscriptions",
            roles: ["super_admin", "admin", "staff", "member"],
          },
          {
            name: "Plans",
            id: crypto.randomUUID(),
            url: "/billing/plans",
            roles: ["super_admin", "admin"],
          },
          {
            name: "Reports",
            id: crypto.randomUUID(),
            url: "/billing/reports",
            roles: ["super_admin", "admin"],
          },
        ],
      },
    ],
  },

  {
    heading: "Management",
    roles: ["super_admin", "admin"],
    children: [
      {
        name: "Staff & Users",
        icon: "solar:user-id-linear",
        id: crypto.randomUUID(),
        url: "/users",
        roles: ["super_admin", "admin"],
        children: [
          {
            /*
             * User filter by organization
             */
            name: "Users",
            id: crypto.randomUUID(),
            url: "/users",
            roles: ["super_admin"],
          },
          {
            /*
             * User filter by branch
             * Admin = organization locked, dropdown selector branch, dropdown selector role ['member', 'staff']
             */
            name: "Team",
            id: crypto.randomUUID(),
            url: "/users/team",
            roles: ["admin"],
          },
        ],
      },
      {
        name: "Branches",
        icon: "solar:shop-linear",
        id: crypto.randomUUID(),
        url: "/branches",
        roles: ["super_admin", "admin"],
        children: [
          {
            name: "List",
            id: crypto.randomUUID(),
            url: "/branches",
            roles: ["super_admin", "admin"],
          },
        ],
      },
      {
        name: "Organization",
        icon: "solar:buildings-2-linear",
        id: crypto.randomUUID(),
        roles: ["super_admin", "admin"],
        children: [
          {
            name: "List",
            id: crypto.randomUUID(),
            url: "/organization",
            roles: ["super_admin"],
          },
          {
            name: "Profile",
            id: crypto.randomUUID(),
            url: "/organization/profile",
            roles: ["admin"],
          },
          {
            name: "Module Config",
            id: crypto.randomUUID(),
            url: "/organization/modules",
            roles: ["super_admin"],
          },
        ],
      },
    ],
  },
];

export { sidebarContent };

export enum ENDPOINTS {
  // Auth
  LOGIN = "/auth/login",
  REGISTER = "/auth/register",
  FORGOT_PASSWORD = "/auth/forgot-password",
  RESET_PASSWORD = "/auth/reset-password",
  REFRESH_TOKEN = "/auth/refresh",
  LOGOUT = "/auth/logout",

  // Users
  USERS = "/users",
  USER_DETAIL = "/users/:id",
  USER_BY_EMAIL = "/users/email/:email",
  USER_CHANGE_PASSWORD = "/users/:id/password",
  PROFILE = "/users/profile",

  // Organizations
  ORGANIZATIONS = "/organizations",
  ORGANIZATION_DETAIL = "/organizations/:id",
  ORGANIZATION_BRANCHES = "/organizations/:id/branches",

  // Modules
  MODULES = "/modules",
  MODULE_DETAIL = "/modules/:id",

  // Branches
  BRANCHES = "/branches",
  BRANCH_DETAIL = "/branches/:id",

  // Members
  MEMBERS = "/members",
  MEMBER_DETAIL = "/members/:id",
  MEMBER_SCANNER = "/members/scanner",
  MEMBER_QR = "/members/qr",
  MEMBER_SESSIONS = "/members/sessions/:branchId",
  MEMBER_VISITORS = "/members/visitors/:branchId",
  MEMBER_ATTENDANCE = "/members/attendance",
  MEMBER_ANALYTICS = "/members/analytics",

  // Plans
  PLANS = "/plans",
  PLAN_DETAIL = "/plans/:id",
  ORGANIZATION_PLANS = "/plans/organization/:id",

  // Subscriptions
  SUBSCRIPTIONS = "/subscriptions",
  SUBSCRIPTION_DETAIL = "/subscriptions/:id",
  SUBSCRIPTION_ACTIVE = "/subscriptions/member/:memberId/active",
  SUBSCRIPTION_RENEW = "/subscriptions/member/:memberId/renew",

  // Chat
  CHAT = "/members/chat",
  CHAT_SESSIONS = "/members/chat/sessions",
  CHAT_SESSION_DETAIL = "/members/chat/sessions/:sessionId",
  CHAT_MESSAGES = "/members/chat/sessions/:sessionId/messages",
}

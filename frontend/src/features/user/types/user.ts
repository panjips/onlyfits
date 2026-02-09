// User Types based on Go DTO

export interface MemberInfo {
  memberId?: string;
  subscriptionId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileResponse extends UserResponse {
  branchId?: string;
  organizationId?: string;
  member?: MemberInfo;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  organizationId?: string;
  branchId?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string;
  branchId?: string;
  role?: string;
}

export type UserRole = "super_admin" | "admin" | "staff" | "member";

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "member", label: "Member" },
];

export const SUPER_ADMIN_ROLES: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  ...USER_ROLES,
];

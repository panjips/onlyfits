export const authKeys = {
	all: ["auth"] as const,
	login: () => [...authKeys.all, "login"] as const,
	logout: () => [...authKeys.all, "logout"] as const,
	register: () => [...authKeys.all, "register"] as const,
	forgotPassword: () => [...authKeys.all, "forgotPassword"] as const,
	resetPassword: () => [...authKeys.all, "resetPassword"] as const,
	me: () => [...authKeys.all, "me"] as const,
};

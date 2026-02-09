import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_APP_URL: z.string().url().optional(),
		VITE_BASE_API_URL: z.string().url().optional(),
		VITE_APP_ENV: z.enum(["development", "production", "staging"]),
	},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
});

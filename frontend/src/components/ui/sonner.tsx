import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4 text-success" />,
				info: <InfoIcon className="size-4 text-info" />,
				warning: <TriangleAlertIcon className="size-4 text-warning" />,
				error: <OctagonXIcon className="size-4 text-error" />,
				loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
			}}
			toastOptions={{
				classNames: {
					toast:
						"group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-md group-[.toaster]:rounded group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:gap-3 group-[.toaster]:font-sans",
					description: "group-[.toast]:text-bodytext group-[.toast]:text-xs",
					title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
					actionButton:
						"group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-semibold transition-colors hover:bg-primary-emphasis",
					cancelButton:
						"group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-semibold transition-colors hover:bg-border",
					closeButton:
						"group-[.toast]:bg-popover group-[.toast]:text-popover-foreground group-[.toast]:border-border group-[.toast]:rounded group-[.toast]:transition-colors hover:bg-muted",
				},
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };

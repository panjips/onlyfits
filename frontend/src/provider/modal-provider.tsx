import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Trash2,
  Save,
  Edit3,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  type LucideIcon,
} from "lucide-react";

export type ConfirmationType =
  | "delete"
  | "edit"
  | "save"
  | "warning"
  | "info"
  | "success"
  | "error"
  | "custom";

export interface ConfirmationConfig {
  type: ConfirmationType;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive" | "warning" | "success" | "info";
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  itemName?: string;
  isLoading?: boolean;
}

interface ModalContextState {
  // Confirmation Modal
  showConfirmation: (config: ConfirmationConfig) => Promise<boolean>;
  hideConfirmation: () => void;
  isConfirmationOpen: boolean;

  // Custom Modal (for future extensibility)
  openModal: (id: string, data?: unknown) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
  getModalData: (id: string) => unknown;
}

const typeConfigs: Record<
  ConfirmationType,
  {
    title: string;
    description: string;
    confirmLabel: string;
    icon: LucideIcon;
    variant: ConfirmationConfig["variant"];
    iconColorClass: string;
    bgColorClass: string;
  }
> = {
  delete: {
    title: "Confirm Delete",
    description:
      "Are you sure you want to delete this item? This action cannot be undone.",
    confirmLabel: "Delete",
    icon: Trash2,
    variant: "destructive",
    iconColorClass: "text-error",
    bgColorClass: "bg-lighterror",
  },
  edit: {
    title: "Confirm Edit",
    description: "Are you sure you want to save these changes?",
    confirmLabel: "Save Changes",
    icon: Edit3,
    variant: "default",
    iconColorClass: "text-primary",
    bgColorClass: "bg-lightprimary",
  },
  save: {
    title: "Confirm Save",
    description: "Are you sure you want to save this data?",
    confirmLabel: "Save",
    icon: Save,
    variant: "success",
    iconColorClass: "text-success",
    bgColorClass: "bg-lightsuccess",
  },
  warning: {
    title: "Warning",
    description: "Are you sure you want to proceed with this action?",
    confirmLabel: "Proceed",
    icon: AlertTriangle,
    variant: "warning",
    iconColorClass: "text-warning",
    bgColorClass: "bg-lightwarning",
  },
  info: {
    title: "Information",
    description: "Please confirm to continue.",
    confirmLabel: "Continue",
    icon: HelpCircle,
    variant: "info",
    iconColorClass: "text-info",
    bgColorClass: "bg-lightinfo",
  },
  success: {
    title: "Success",
    description: "Operation completed successfully.",
    confirmLabel: "OK",
    icon: CheckCircle,
    variant: "success",
    iconColorClass: "text-success",
    bgColorClass: "bg-lightsuccess",
  },
  error: {
    title: "Error",
    description: "An error occurred. Please try again.",
    confirmLabel: "Retry",
    icon: XCircle,
    variant: "destructive",
    iconColorClass: "text-error",
    bgColorClass: "bg-lighterror",
  },
  custom: {
    title: "Confirm",
    description: "Are you sure you want to continue?",
    confirmLabel: "Confirm",
    icon: AlertCircle,
    variant: "default",
    iconColorClass: "text-primary",
    bgColorClass: "bg-lightprimary",
  },
};

const ModalContext = createContext<ModalContextState | undefined>(undefined);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  // Confirmation Modal State
  const [confirmationConfig, setConfirmationConfig] =
    useState<ConfirmationConfig | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmResolver, setConfirmResolver] = useState<
    ((value: boolean) => void) | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [openModals, setOpenModals] = useState<Map<string, unknown>>(new Map());

  const showConfirmation = useCallback(
    (config: ConfirmationConfig): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfirmationConfig(config);
        setIsConfirmationOpen(true);
        setConfirmResolver(() => resolve);
      });
    },
    []
  );

  // Hide Confirmation Modal
  const hideConfirmation = useCallback(() => {
    setIsConfirmationOpen(false);
    setConfirmationConfig(null);
    setIsProcessing(false);
    if (confirmResolver) {
      confirmResolver(false);
      setConfirmResolver(null);
    }
  }, [confirmResolver]);

  // Handle Confirm Action
  const handleConfirm = useCallback(async () => {
    if (!confirmationConfig) return;

    setIsProcessing(true);
    try {
      if (confirmationConfig.onConfirm) {
        await confirmationConfig.onConfirm();
      }
      if (confirmResolver) {
        confirmResolver(true);
        setConfirmResolver(null);
      }
      setIsConfirmationOpen(false);
      setConfirmationConfig(null);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [confirmationConfig, confirmResolver]);

  // Handle Cancel Action
  const handleCancel = useCallback(() => {
    if (confirmationConfig?.onCancel) {
      confirmationConfig.onCancel();
    }
    hideConfirmation();
  }, [confirmationConfig, hideConfirmation]);

  // Custom Modal Methods
  const openModal = useCallback((id: string, data?: unknown) => {
    setOpenModals((prev) => new Map(prev).set(id, data));
  }, []);

  const closeModal = useCallback((id: string) => {
    setOpenModals((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const isModalOpen = useCallback(
    (id: string) => openModals.has(id),
    [openModals]
  );

  const getModalData = useCallback(
    (id: string) => openModals.get(id),
    [openModals]
  );

  // Get merged config with defaults
  const getConfig = () => {
    if (!confirmationConfig) return null;
    const defaults = typeConfigs[confirmationConfig.type];
    return {
      ...defaults,
      ...confirmationConfig,
      title: confirmationConfig.title || defaults.title,
      description: confirmationConfig.itemName
        ? defaults.description.replace(
            "this item",
            `"${confirmationConfig.itemName}"`
          )
        : confirmationConfig.description || defaults.description,
      confirmLabel: confirmationConfig.confirmLabel || defaults.confirmLabel,
      cancelLabel: confirmationConfig.cancelLabel || "Cancel",
      icon: confirmationConfig.icon || defaults.icon,
    };
  };

  const config = getConfig();

  const value: ModalContextState = {
    showConfirmation,
    hideConfirmation,
    isConfirmationOpen,
    openModal,
    closeModal,
    isModalOpen,
    getModalData,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* Confirmation Modal */}
      <Dialog
        open={isConfirmationOpen}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="gap-4">
            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold">
                {config?.title}
              </DialogTitle>
              <DialogDescription className="font-normal tracking-[0.005em] text-sm text-muted-foreground">
                {config?.description}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="">
            <Button
              variant="lightprimary"
              onClick={handleCancel}
              disabled={isProcessing}
              className="min-w-[100px]"
            >
              {config?.cancelLabel}
            </Button>
            <Button
              variant={"default"}
              onClick={handleConfirm}
              disabled={isProcessing || confirmationConfig?.isLoading}
              className="min-w-[100px]"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </span>
              ) : (
                config?.confirmLabel
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  return context;
}

export function useConfirmDelete() {
  const { showConfirmation } = useModal();

  return useCallback(
    async (
      itemName?: string,
      onConfirm?: () => void | Promise<void>
    ): Promise<boolean> => {
      return showConfirmation({
        type: "delete",
        itemName,
        onConfirm,
      });
    },
    [showConfirmation]
  );
}

export function useConfirmEdit() {
  const { showConfirmation } = useModal();

  return useCallback(
    async (
      itemName?: string,
      onConfirm?: () => void | Promise<void>
    ): Promise<boolean> => {
      return showConfirmation({
        type: "edit",
        itemName,
        onConfirm,
      });
    },
    [showConfirmation]
  );
}

export function useConfirmSave() {
  const { showConfirmation } = useModal();

  return useCallback(
    async (
      itemName?: string,
      onConfirm?: () => void | Promise<void>
    ): Promise<boolean> => {
      return showConfirmation({
        type: "save",
        itemName,
        onConfirm,
      });
    },
    [showConfirmation]
  );
}

export function useConfirmation() {
  const { showConfirmation } = useModal();

  return useCallback(
    async (config: ConfirmationConfig): Promise<boolean> => {
      return showConfirmation(config);
    },
    [showConfirmation]
  );
}

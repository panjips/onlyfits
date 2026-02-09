import { TitlePage } from "@/components/shared";
import { ModuleUpsertForm } from "../components/module-upsert-form";

export const CreateModulePage = () => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Create Module"
        description="Set up a new module for organizations."
      />
      <ModuleUpsertForm mode="create" redirectTo="/organization/modules" />
    </div>
  );
};

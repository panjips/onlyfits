import { TitlePage } from "@/components/shared";
import { ModuleUpsertForm } from "../components/module-upsert-form";

interface UpdateModulePageProps {
  moduleId: string;
}

export const UpdateModulePage = ({ moduleId }: UpdateModulePageProps) => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Update Module"
        description="Modify module details."
      />
      <ModuleUpsertForm
        mode="update"
        moduleId={moduleId}
        redirectTo="/organization/modules"
      />
    </div>
  );
};

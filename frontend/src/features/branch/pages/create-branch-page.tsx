import { TitlePage } from "@/components/shared";
import { BranchUpsertForm } from "../components";

export const CreateBranchPage = () => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Create Branch"
        description="Set up a new branch location."
      />
      <BranchUpsertForm mode="create" redirectTo="/branches" />
    </div>
  );
};

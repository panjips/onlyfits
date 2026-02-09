import { TitlePage } from "@/components/shared";
import { BranchUpsertForm } from "../components";

interface UpdateBranchPageProps {
  branchId: string;
}

export const UpdateBranchPage = ({ branchId }: UpdateBranchPageProps) => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Update Branch"
        description="Modify branch details and settings."
      />
      <BranchUpsertForm
        mode="update"
        branchId={branchId}
        redirectTo="/branches"
      />
    </div>
  );
};

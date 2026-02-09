import { TitlePage } from "@/components/shared";
import { PlanUpsertForm } from "../components";

export const CreatePlanPage = () => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Create New Plan"
        description="Add a new membership plan to your organization."
      />
      <PlanUpsertForm mode="create" />
    </div>
  );
};

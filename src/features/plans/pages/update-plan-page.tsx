import { TitlePage } from "@/components/shared";
import { PlanUpsertForm } from "../components";

interface UpdatePlanPageProps {
  planId: string;
}

export const UpdatePlanPage = ({ planId }: UpdatePlanPageProps) => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Update Plan"
        description="Edit the details of this membership plan."
      />
      <PlanUpsertForm mode="update" planId={planId} />
    </div>
  );
};

import { TitlePage } from "@/components/shared";
import { MemberUpsertForm } from "../components";

export const CreateMemberPage = () => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Create New Member"
        description="Add a new member to your gym."
      />
      <MemberUpsertForm mode="create" />
    </div>
  );
};

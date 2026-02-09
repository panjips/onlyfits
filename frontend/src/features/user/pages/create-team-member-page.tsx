import { TitlePage } from "@/components/shared";
import { UserUpsertForm } from "../components";

export const CreateTeamMemberPage = () => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Add Team Member"
        description="Add a new member to your organization."
      />
      <UserUpsertForm
        mode="create"
        redirectTo="/users/team"
        isTeamMode={true}
      />
    </div>
  );
};

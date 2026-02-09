import { TitlePage } from "@/components/shared";
import { UserUpsertForm } from "../components";

interface UpdateTeamMemberPageProps {
  userId: string;
}

export const UpdateTeamMemberPage = ({ userId }: UpdateTeamMemberPageProps) => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Update Team Member"
        description="Modify team member details and settings."
      />
      <UserUpsertForm
        mode="update"
        userId={userId}
        redirectTo="/users/team"
        isTeamMode={true}
      />
    </div>
  );
};

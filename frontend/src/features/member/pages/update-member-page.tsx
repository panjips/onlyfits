import { TitlePage } from "@/components/shared";
import { MemberUpsertForm } from "../components";

interface UpdateMemberPageProps {
  memberId: string;
}

export const UpdateMemberPage = ({ memberId }: UpdateMemberPageProps) => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Update Member"
        description="Edit the details of this member."
      />
      <MemberUpsertForm mode="update" memberId={memberId} />
    </div>
  );
};

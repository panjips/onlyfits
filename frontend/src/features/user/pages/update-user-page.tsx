import { TitlePage } from "@/components/shared";
import { UserUpsertForm } from "../components";

interface UpdateUserPageProps {
  userId: string;
}

export const UpdateUserPage = ({ userId }: UpdateUserPageProps) => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Update User"
        description="Modify user details and settings."
      />
      <UserUpsertForm mode="update" userId={userId} redirectTo="/users" />
    </div>
  );
};

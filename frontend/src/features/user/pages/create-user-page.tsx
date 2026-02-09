import { TitlePage } from "@/components/shared";
import { UserUpsertForm } from "../components";

export const CreateUserPage = () => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Create User"
        description="Add a new user to the system."
      />
      <UserUpsertForm mode="create" redirectTo="/users" />
    </div>
  );
};

import { TitlePage } from "@/components/shared";
import { OrganizationUpsertForm } from "@/features/organization";

export const CreateOrganizationPage = () => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Create Organization"
        description="Set up a new organization with modules."
      />
      <OrganizationUpsertForm mode="create" redirectTo="/organization" />
    </div>
  );
};

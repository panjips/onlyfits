import { TitlePage } from "@/components/shared";
import { OrganizationUpsertForm } from "@/features/organization";

interface UpdateOrganizationPageProps {
  organizationId: string;
}

export const UpdateOrganizationPage = ({ organizationId }: UpdateOrganizationPageProps) => {
  return (
    <div className="space-y-6">
      <TitlePage
        title="Update Organization"
        description="Modify organization details and modules."
      />
      <OrganizationUpsertForm
        mode="update"
        organizationId={organizationId}
        redirectTo="/organization"
      />
    </div>
  );
};

import { Icon } from "@iconify/react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import SimpleBar from "simplebar-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutMutation } from "@/features/auth";
import { useUser } from "@/provider";
import { Button } from "../ui/button";
import * as profileData from "./data";

const Profile = () => {
  const { mutateAsync } = useMutation(logoutMutation);
  const { clearUser } = useUser();
  const navigate = useNavigate();
  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await mutateAsync();
      clearUser();
      navigate({ to: "/login" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative group/menu ps-1 sm:ps-15 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <span className="hover:text-primary hover:bg-lightprimary rounded-lg flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <img
              src={"/profile/user-2.webp"}
              alt="logo"
              height="35"
              width="35"
              className="rounded-lg"
            />
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-screen sm:w-50 pb-6 pt-4 rounded-sm"
        >
          <SimpleBar>
            {profileData.profileDD.map((items, index) => (
              <DropdownMenuItem
                key={`${index}-${items.title}`}
                asChild
                className="px-4 py-2 flex justify-between items-center bg-hover group/link w-full cursor-pointer"
              >
                <Link to={items.url}>
                  <div className="w-full">
                    <div className="ps-0 flex items-center gap-3 w-full">
                      <Icon
                        icon={items.icon}
                        className="text-lg text-muted-foreground group-hover/link:text-primary"
                      />
                      <div className="w-3/4">
                        <h5 className="mb-0 text-sm text-muted-foreground group-hover/link:text-primary">
                          {items.title}
                        </h5>
                      </div>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </SimpleBar>

          <DropdownMenuSeparator className="my-2" />

          <div className="pt-2 px-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-md"
            >
              Logout
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Profile;

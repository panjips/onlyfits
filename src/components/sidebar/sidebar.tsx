import SimpleBar from 'simplebar-react';
import { Icon } from '@iconify/react';
import { Link, useLocation } from '@tanstack/react-router';
import { AMLogo, AMMenu, AMMenuItem, AMSidebar, AMSubmenu } from 'tailwind-sidebar';
import 'tailwind-sidebar/styles.css';
import { useTheme } from 'next-themes';
import { sidebarContent, type MenuItem, type UserRole } from './sidebar-items';
import { useUser } from '@/provider';
import { useMemo } from 'react';

interface SidebarItemType {
  heading?: string
  id?: number | string
  name?: string
  title?: string
  icon?: string
  url?: string
  children?: SidebarItemType[]
  disabled?: boolean
  isPro?: boolean
}

const renderSidebarItems = (
  items: SidebarItemType[],
  currentPath: string,
  onClose?: () => void,
  isSubItem: boolean = false,
) => {
  return items.map((item) => {
    const isSelected = currentPath === item?.url;
    const IconComp = item.icon || null;

    const iconElement = IconComp ? (
      <Icon icon={IconComp} height={21} width={21} />
    ) : (
      <Icon icon={'ri:checkbox-blank-circle-line'} height={9} width={9} />
    );

    // Heading
    if (item.heading) {
      return (
        <div className="mb-1" key={item.heading}>
          <AMMenu
            subHeading={item.heading}
            ClassName="hide-menu leading-21 text-sidebar-foreground font-bold uppercase text-xs dark:text-sidebar-foreground"
          />
        </div>
      );
    }

    // Submenu
    if (item.children?.length) {
      return (
        <AMSubmenu
          key={item.id}
          icon={iconElement}
          title={item.name}
          ClassName="mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground"
        >
          {renderSidebarItems(item.children, currentPath, onClose, true)}
        </AMSubmenu>
      );
    }

    // Regular menu item
    const linkTarget = item.url?.startsWith('https') ? '_blank' : '_self';

    const itemClassNames = isSubItem
      ? `mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground !hover:bg-transparent ${
          isSelected ? '!bg-transparent !text-primary' : ''
        }`
      : `mt-0.5 text-sidebar-foreground dark:text-sidebar-foreground`;

    return (
      <div onClick={onClose}>
        <AMMenuItem
          key={item.id}
          icon={iconElement}
          isSelected={isSelected}
          link={item.url || undefined}
          target={linkTarget}
          badge={!!item.isPro}
          badgeColor="bg-lightsecondary"
          badgeTextColor="text-secondary"
          disabled={item.disabled}
          badgeContent={item.isPro ? 'Pro' : undefined}
          component={Link}
          className={`${itemClassNames}`}
        >
          <span className="truncate flex-1">{item.title || item.name}</span>
        </AMMenuItem>
      </div>
    );
  });
};

function filterMenuByRole<
	T extends { roles?: UserRole[]; children?: MenuItem[] },
>(menu: T[], role: UserRole): T[] {
	return menu
		.filter((item) => !item.roles || item.roles.includes(role))
		.map((item) =>
			item.children
				? { ...item, children: filterMenuByRole(item.children as T[], role) }
				: item,
		);
}


const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { theme } = useTheme();
  const sidebarMode = theme === 'light' || theme === 'dark' ? theme : undefined;
  	const { user, isAuthenticated, isLoading } = useUser();

	const filteredMenu = useMemo(() => {
		if (isAuthenticated && !isLoading && user) {
			return filterMenuByRole(sidebarContent, user.role as UserRole);
		}
		return [];
	}, [isAuthenticated, isLoading, user]);

  return (
    <AMSidebar
      collapsible="none"
      animation={true}
      showProfile={false}
      width={'270px'}
      showTrigger={false}
      mode={sidebarMode}
      className="fixed left-0 top-0 border border-border dark:border-border bg-sidebar dark:bg-sidebar z-10 h-screen"
    >
      {/* Logo */}
      <div className="px-6 flex items-center brand-logo overflow-hidden">
        <AMLogo component={Link} href="/" img="">
          {/* <FullLogo /> */}
        </AMLogo>
      </div>

      {/* Sidebar items */}

      <SimpleBar className="h-[calc(100vh-100px)]">
        <div className="px-6">
          {filteredMenu.map((section, index) => (
            <div key={index}>
              {renderSidebarItems(
                [
                  ...(section.heading ? [{ heading: section.heading }] : []),
                  ...(section.children || []),
                ],
                pathname,
                onClose,
              )}
            </div>
          ))}
        </div>
      </SimpleBar>
    </AMSidebar>
  );
};

export { Sidebar};

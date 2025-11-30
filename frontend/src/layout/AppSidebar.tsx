import { NavLink } from "react-router-dom";
import geaLogo from "../assets/gea-logo.svg";
import {
  GridIcon,
  ListIcon,
  UserCircleIcon,
  PlugInIcon,
  CalenderIcon,
  HorizontaLDots,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { name: "Dashboard", icon: <GridIcon />, path: "/" },
  { name: "Campañas", icon: <CalenderIcon />, path: "/campaigns" },
  { name: "Links", icon: <PlugInIcon />, path: "/links" },
  { name: "Candidatos", icon: <UserCircleIcon />, path: "/candidates" },
  { name: "Blacklist", icon: <ListIcon />, path: "/blacklist" },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, setIsHovered } = useSidebar();

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm lg:hidden" />
      )}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`shadow-theme-lg fixed inset-y-0 left-0 z-[9999] flex h-screen flex-col border-r border-gray-200 bg-white px-4 py-5 text-gray-900 transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 ${
          isExpanded ? "w-72" : "w-[86px]"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="shadow-theme-sm flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 dark:bg-gray-800">
              <img
                src={geaLogo}
                alt="GEA"
                className="h-full w-full object-contain transition duration-200 dark:invert"
              />
            </div>
            {isExpanded && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  StaffLink
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Dashboard
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "menu-item",
                  isActive
                    ? "menu-item-active shadow-theme-sm"
                    : "menu-item-inactive",
                  !isExpanded ? "justify-center" : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              <span className="menu-item-icon-size menu-item-icon-inactive">
                {item.icon}
              </span>
              {isExpanded && (
                <span className="menu-item-text">
                  {item.name}
                  {item.badge && (
                    <span className="bg-brand-50 text-brand-500 ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                      {item.badge}
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className={`shadow-theme-sm mt-6 rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300 ${isExpanded ? "" : "text-center"}`}
        >
          <p className="font-semibold text-gray-900 dark:text-white">Soporte</p>
          {isExpanded ? (
            <p>help@stafflink</p>
          ) : (
            <HorizontaLDots className="mx-auto" />
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;

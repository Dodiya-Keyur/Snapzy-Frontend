import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { NavLink } from "react-router-dom";

function BottomNav() {
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Search",
      path: "/search",
      icon: Search,
    },
    {
      name: "Create Post",
      path: "/create-post",
      icon: PlusSquare,
    },
    {
      name: "Activity",
      path: "/activity",
      icon: Heart,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex h-full flex-1 flex-col items-center justify-center gap-1 text-xs transition ${isActive
                  ? "text-black"
                  : "text-gray-500"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={23}
                    strokeWidth={isActive ? 2.5 : 2}
                    fill={
                      item.name === "Activity" &&
                        isActive
                        ? "currentColor"
                        : "none"
                    }
                  />

                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
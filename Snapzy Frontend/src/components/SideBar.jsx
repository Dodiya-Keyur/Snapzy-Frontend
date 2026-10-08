import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    Home,
    Search,
    Compass,
    Bell,
    MessageCircle,
    PlusSquare,
    Bookmark,
    User,
    Settings,
    LogOut,
    Camera,
} from "lucide-react";

const Sidebar = () => {

    const navigate = useNavigate();

    const menuItems = [
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
            name: "Notifications",
            path: "/notifications",
            icon: Bell,
        },
        {
            name: "Create Post",
            path: "/create-post",
            icon: PlusSquare,
        },
        {
            name: "Saved",
            path: "/saved",
            icon: Bookmark,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: User,
        },
    ];

    const bottomItems = [
        {
            name: "Setting",
            path: "/setting",
            icon: Settings,
        },
    ];

    const handleLogout = () => {
        // Call your logout API here

        navigate("/login");
    };

    return (
        <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-gray-100 px-4 py-6 hidden md:flex">

            {/* ================= LOGO ================= */}

            <NavLink to="/" >
                <div className="mb-8 flex items-center gap-3 px-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
                        <Camera
                            size={22}
                            className="text-white"
                        />
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Snapzy
                    </h1>

                </div>
            </NavLink>

            {/* ================= MAIN MENU ================= */}
            <nav className="flex-1">

                <ul className="space-y-2">

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        return (
                            <li key={item.name}>

                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-white text-gray-900 font-semibold"
                                            : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
                                        }`
                                    }
                                >

                                    {({ isActive }) => (
                                        <>
                                            <Icon
                                                size={22}
                                                strokeWidth={isActive ? 2.5 : 2}
                                                className="transition-transform duration-200 group-hover:scale-105"
                                            />

                                            <span>
                                                {item.name}
                                            </span>
                                        </>
                                    )}

                                </NavLink>

                            </li>
                        );
                    })}

                </ul>

            </nav>


            {/* ================= BOTTOM MENU ================= */}
            <div className="border-t border-gray-200 pt-4">

                <ul className="space-y-2">

                    {bottomItems.map((item) => {

                        const Icon = item.icon;

                        return (
                            <li key={item.name}>

                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        }`
                                    }
                                >

                                    <Icon size={22} />

                                    <span>
                                        {item.name}
                                    </span>

                                </NavLink>

                            </li>
                        );
                    })}


                    {/* Logout */}
                    <li>

                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
                        >

                            <LogOut size={22} />

                            <span>
                                Logout
                            </span>

                        </button>

                    </li>

                </ul>

            </div>

        </aside>
    );
};

export default Sidebar;
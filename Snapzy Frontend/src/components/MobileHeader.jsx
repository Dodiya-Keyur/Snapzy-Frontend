import { Bell, Camera, Link } from "lucide-react";
import { NavLink } from "react-router-dom";

function MobileHeader() {

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white lg:hidden">
      <div className="flex h-16 items-center justify-between px-5">

        {/* Logo */}


        <NavLink to="/" >

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
              <Camera
                size={21}
                strokeWidth={2.2}
                className="text-white"
              />
            </div>

            <span className="text-xl font-bold tracking-tight text-gray-900">
              Snapzy
            </span>

          </div>

        </NavLink>


        {/* Notification */}

        <NavLink to="/notifications" >

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100"
          >
            <Bell
              size={24}
              strokeWidth={2}
              className="text-gray-900"
            />

            {/* Notification Badge */}
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
          </button>

        </NavLink>

      </div>

    </header>
  );
}

export default MobileHeader;
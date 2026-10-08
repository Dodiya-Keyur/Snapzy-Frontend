import { Outlet } from "react-router-dom"
import Sidebar from "./components/SideBar"
import BottomNav from "./components/BottomNav"
import MobileHeader from "./components/MobileHeader"


function App() {
    return (
        <div className="min-h-screen bg-gray-50 mt-20 md:mt-0">

            <MobileHeader />
            <Sidebar />

            <main className="min-h-screen md:ml-[270px] lg:ml-[300px]">
                <Outlet />
            </main>

            <BottomNav />

        </div>
    )
}

export default App
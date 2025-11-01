import { Outlet, useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useSelector } from "react-redux";
import { useEffect } from "react";

export default function AdminLayout() {
    // const {isLoggedin } = useSelector((state:any) => state.auth);
    // const navigate = useNavigate();

    // useEffect(() => { 
    //   console.log("Please Login ....")
    //   if(!isLoggedin){
    //     navigate('/login');
    //   }
    // }, [])
    
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      
      <div className="flex-1 md:ml-64 w-full">
        <AdminNavbar />
        
        <main className="p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

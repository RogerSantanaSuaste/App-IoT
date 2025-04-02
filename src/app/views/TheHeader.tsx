'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import user from "../img/user.png";
import { LogOut, Menu } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

const TheHeader: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Listen for authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 shadow-md w-full">
      <div className="px-4 w-full">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center md:hidden">
            <button
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1"></div>

          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="flex items-center space-x-2" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-700 hover:border-blue-500 transition-colors duration-200">
                    <Image src={user || "/placeholder.svg"} alt="User" width={32} height={32} className="object-cover" />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </button>
                    <button
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors duration-200"
                    >
                      <a
                      href="reset-password">Cambiar Contraseña</a>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TheHeader;

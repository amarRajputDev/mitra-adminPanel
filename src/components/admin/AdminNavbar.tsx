import { Bell, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function AdminNavbar() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 px-4 sm:px-6 ml-0 md:ml-0">
        {/* Search Bar - Desktop */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users, tenders, payments..."
              className="pl-10 bg-background"
            />
          </div>
        </div>

        {/* Mobile Search Icon */}
        <Button variant="ghost" size="icon" className="sm:hidden rounded-full">
          <Search className="h-5 w-5" />
        </Button>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
          </Button>

          {/* Admin Avatar */}
          <div className="ml-1 sm:ml-2 flex items-center gap-2">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold cursor-pointer hover:opacity-90 transition-opacity">
              A
            </div>
            <span className="hidden lg:block text-sm font-medium">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}

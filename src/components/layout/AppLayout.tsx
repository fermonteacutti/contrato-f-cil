import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

const AppLayout = () => {
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Usuário";
  const credits = profile?.credits_remaining ?? "—";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <span className="text-sm text-muted-foreground">Bem-vindo,</span>
            <span className="text-sm font-semibold text-foreground ml-1">{displayName}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent">
              <span className="text-xs font-semibold">{credits} créditos</span>
            </div>
            <NotificationDropdown />
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

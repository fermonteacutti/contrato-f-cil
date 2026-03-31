import { Navigate, Outlet } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

const AdminRoute = () => {
  const { session, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const hasShownToast = useRef(false);

  const loading = authLoading || profileLoading;
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!loading && session && !isAdmin && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error("Acesso negado: você não tem permissão de administrador.");
    }
  }, [loading, session, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;

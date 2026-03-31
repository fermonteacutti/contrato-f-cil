import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Pencil, Save, User, CreditCard } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const planLabels: Record<string, string> = {
  free: "Gratuito",
  starter: "Starter",
  professional: "Profissional",
  enterprise: "Enterprise",
};

const Settings = () => {
  const { data: profile, isLoading } = useProfile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setName(profile?.full_name || "");
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name })
        .eq("id", user.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Nome atualizado com sucesso!");
      setEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar nome");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const displayPlan = planLabels[profile?.plan || "free"] || profile?.plan || "Gratuito";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie seus dados e plano</p>
      </div>

      {/* Profile */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              {editing ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-foreground">{profile?.full_name || "—"}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleEdit}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">E-mail</label>
              <p className="text-sm text-foreground mt-1">{user?.email || "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de perfil</label>
              <p className="text-sm text-foreground mt-1 capitalize">{profile?.profile_type || "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-sm text-foreground mt-1 capitalize">{profile?.role || "user"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Plan */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="font-heading text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className="text-sm">{displayPlan}</Badge>
              <span className="text-sm text-muted-foreground">
                {profile?.credits_remaining ?? 0} créditos restantes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

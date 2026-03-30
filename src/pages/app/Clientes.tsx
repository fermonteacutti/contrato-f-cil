import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { useState } from "react";
import { useClients, Client } from "@/hooks/useClients";
import ClienteModal from "@/components/clientes/ClienteModal";
import { toast } from "sonner";

const Clientes = () => {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const { clientsQuery, deleteClient } = useClients();

  const clients = clientsQuery.data ?? [];
  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.cpf_cnpj && c.cpf_cnpj.includes(search))
  );

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient.mutateAsync(id);
      toast.success("Cliente excluído com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir cliente");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {clients.length} {clients.length === 1 ? "cliente cadastrado" : "clientes cadastrados"}
          </p>
        </div>
        <Button onClick={handleNew} className="font-heading font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou CPF/CNPJ..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {clientsQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <h3 className="font-heading font-semibold text-foreground mb-1">
            {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search
              ? "Tente buscar com outros termos."
              : "Cadastre seu primeiro cliente para começar."}
          </p>
          {!search && (
            <Button onClick={handleNew} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar cliente
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Nome</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead className="hidden md:table-cell">Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell className="text-muted-foreground">{client.cpf_cnpj || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {client.email || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {client.phone || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(client)}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Excluir">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir <strong>{client.name}</strong>? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(client.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ClienteModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        client={editingClient}
      />
    </div>
  );
};

export default Clientes;

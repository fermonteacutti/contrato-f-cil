import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreHorizontal, Mail, Phone } from "lucide-react";
import { useState } from "react";

const mockClients = [
  { id: 1, name: "Maria Silva", cpfCnpj: "123.456.789-00", email: "maria@email.com", phone: "(11) 99999-0001", processes: 3 },
  { id: 2, name: "João Santos", cpfCnpj: "987.654.321-00", email: "joao@email.com", phone: "(11) 99999-0002", processes: 1 },
  { id: 3, name: "Ana Costa", cpfCnpj: "456.789.123-00", email: "ana@email.com", phone: "(11) 99999-0003", processes: 2 },
  { id: 4, name: "Pedro Oliveira", cpfCnpj: "12.345.678/0001-90", email: "pedro@empresa.com", phone: "(11) 99999-0004", processes: 5 },
  { id: 5, name: "Lucia Ferreira", cpfCnpj: "321.654.987-00", email: "lucia@email.com", phone: "(11) 99999-0005", processes: 1 },
];

const Clientes = () => {
  const [search, setSearch] = useState("");
  const filtered = mockClients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cpfCnpj.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">{mockClients.length} clientes cadastrados</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-heading font-600">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((client) => (
          <Card key={client.id} className="shadow-card border-border/50 hover:shadow-card-hover transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {client.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-1">{client.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{client.cpfCnpj}</p>
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> {client.email}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {client.phone}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  {client.processes} {client.processes === 1 ? "processo" : "processos"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clientes;

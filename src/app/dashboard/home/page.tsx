// src/app/dashboard/home/page.tsx
"use client";

import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Upload, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Image from "next/image";
import ClientColumn from "@/components/ClientColumn";
import ClientDetailsModal from "@/components/ClientDetailsModal";

type Client = {
  id: string;
  name: string;
  status: "Active" | "Closed";
  date: string;
};
type ImageData = { src: string; name: string };

const initialClients: Client[] = [
  { id: "1", name: "John Doe", status: "Active", date: "2025-01-15" },
  { id: "2", name: "Jane Smith", status: "Active", date: "2025-02-20" },
];

export default function HomePage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("name");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<ImageData | null>(null);
  const [agentProfile, setAgentProfile] = useState<ImageData | null>(null);
  const [companyDetails, setCompanyDetails] = useState({
    businessName: "Acme Insurance",
    agentName: "Steven Johnson",
    email: "steve@iulcalculatorpro.com",
    phone: "760-517-8105",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedClients = localStorage.getItem("clients");
      if (savedClients) setClients(JSON.parse(savedClients));

      const savedLogo = localStorage.getItem("companyLogo");
      if (savedLogo) setCompanyLogo(JSON.parse(savedLogo));

      const savedProfile = localStorage.getItem("agentProfile");
      if (savedProfile) setAgentProfile(JSON.parse(savedProfile));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clients", JSON.stringify(clients));
      localStorage.setItem("companyLogo", JSON.stringify(companyLogo));
      localStorage.setItem("agentProfile", JSON.stringify(agentProfile));
    }
  }, [clients, companyLogo, agentProfile]);

  const moveClient = (id: string, toColumn: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: toColumn === "Your Closed Sales" ? "Closed" : "Active",
            }
          : c
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    setSelectedClient(null);
  };

  const addClient = (name: string) => {
    const newClient: Client = {
      id: Date.now().toString(),
      name,
      status: "Active" as const,
      date: new Date().toISOString().split("T")[0],
    };
    setClients((prev) => [...prev, newClient]); // Append without filtering
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (data: ImageData | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const src = reader.result as string;
        const data = { src, name: file.name };
        setter(data);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredClients = clients
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "date")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.status.localeCompare(b.status);
    });

  const columns = [
    "Pro Sample Files",
    "Your Sample Files",
    "Your Prospect Files",
    "Your Closed Sales",
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex min-h-[calc(100vh-8rem)]">
        {/* Left Sidebar */}
        <motion.aside
          animate={{ width: isCollapsed ? "4rem" : "30%" }}
          className="bg-white shadow-sm p-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="mb-4"
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
          {!isCollapsed && (
            <div className="space-y-4">
              <div>
                <div className="flex items-end justify-between gap-2 mb-2">
                  {companyLogo ? (
                    <Image
                      src={companyLogo.src}
                      alt="Company Logo"
                      width={300}
                      height={100}
                      className="object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 flex items-center justify-center">
                      No Logo
                    </div>
                  )}
                  <Button asChild>
                    <label>
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setCompanyLogo)}
                      />
                    </label>
                  </Button>
                  {companyLogo && (
                    <Button
                      variant="ghost"
                      onClick={() => setCompanyLogo(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Agent Profile Pic"
                  value={agentProfile ? agentProfile.name : ""}
                  readOnly
                  className="mb-2"
                />
                <div className="flex items-end justify-between gap-2 mb-2">
                  {agentProfile ? (
                    <Image
                      src={agentProfile.src}
                      alt="Agent Profile"
                      width={300}
                      height={100}
                      className="object-contain"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 flex items-center justify-center">
                      No Profile
                    </div>
                  )}
                  <Button asChild>
                    <label>
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setAgentProfile)}
                      />
                    </label>
                  </Button>
                  {agentProfile && (
                    <Button
                      variant="ghost"
                      onClick={() => setAgentProfile(null)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {Object.entries(companyDetails).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <Label>{key.replace(/([A-Z])/g, " $1").trim()}</Label>
                    <Input
                      value={value}
                      disabled={!isEditing}
                      onChange={(e) =>
                        setCompanyDetails({
                          ...companyDetails,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button onClick={() => setIsEditing(true)}>Edit</Button>
                  <Button onClick={() => setIsEditing(false)}>Save</Button>
                </div>
              </div>
              <div>
                <Label>Insurance Companies</Label>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>Allianz</li>
                  <li>Corebridge</li>
                  <li>Lincoln</li>
                  <li>Midland</li>
                  <li>Minnesota Life</li>
                  <li>North American</li>
                </ul>
                <Button variant="outline" className="mt-2 w-full">
                  Request An Additional Provider
                </Button>
              </div>
            </div>
          )}
        </motion.aside>

        {/* Right Content */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sample Files */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline">Sample 1</Button>
                  <Button variant="outline">Sample 2</Button>
                </div>
              </CardContent>
            </Card>

            {/* New Client */}
            <Card>
              <CardHeader>
                <CardTitle>New Client</CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Client Name" />
                <Button
                  className="mt-2"
                  onClick={() =>
                    addClient(
                      (
                        document.querySelector(
                          "input[placeholder='Client Name']"
                        ) as HTMLInputElement
                      )?.value || ""
                    )
                  }
                >
                  Add Client
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Client List */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>IUL Client Files Without a Pension</CardTitle>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">
                  New
                </Button>
                <Button variant="outline" size="sm">
                  Open
                </Button>
                <Button variant="outline" size="sm">
                  Copy
                </Button>
                <Button variant="outline" size="sm">
                  Rename
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-xs"
                />
                <Select
                  onValueChange={(value) =>
                    setSortBy(value as "name" | "date" | "status")
                  }
                  defaultValue="name"
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {columns.map((col, index) => (
                  <Card key={col}>
                    <CardHeader>
                      <CardTitle>{col}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {filteredClients
                          .filter((c) => {
                            if (col === "Pro Sample Files") return true;
                            if (col === "Your Sample Files")
                              return c.status === "Active";
                            if (col === "Your Prospect Files")
                              return c.status === "Active";
                            return c.status === "Closed";
                          })
                          .map((client) => (
                            <ClientColumn
                              key={client.id}
                              status={col}
                              clients={[client]}
                              moveClient={moveClient}
                              onClientClick={setSelectedClient}
                              allowDrop={index >= 2} // Enable drop for last two columns only
                            />
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onDelete={() => deleteClient(selectedClient.id)}
        />
      )}
    </DndProvider>
  );
}

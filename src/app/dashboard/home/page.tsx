"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Upload, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import ClientColumn from "@/components/ClientColumn";
import ClientDetailsModal from "@/components/ClientDetailsModal";

type Client = {
  id: string;
  name: string;
  status: "Active" | "Closed";
  date: string;
  category:
    | "Pro Sample Files"
    | "Your Sample Files"
    | "Your Prospect Files"
    | "Your Closed Sales";
};

type ImageData = { src: string; name: string };

const initialClients: Client[] = [
  {
    id: "1",
    name: "John Doe",
    status: "Active",
    date: "2025-01-15",
    category: "Your Prospect Files",
  },
  {
    id: "2",
    name: "Jane Smith",
    status: "Active",
    date: "2025-02-20",
    category: "Your Prospect Files",
  },
];

export default function HomePage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "status">("name");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [companyLogo, setCompanyLogo] = useState<ImageData | null>(null);
  const [agentProfile, setAgentProfile] = useState<ImageData | null>(null);
  const [companyDetails, setCompanyDetails] = useState({
    businessName: "Acme Insurance",
    agentName: "Steven Johnson",
    email: "steve@iulcalculatorpro.com",
    phone: "760-517-8105",
  });
  const [isEditing, setIsEditing] = useState(false);

  const clientNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedClients = localStorage.getItem("clients");
      if (savedClients) {
        const parsedClients: Client[] = JSON.parse(savedClients);
        setClients(
          parsedClients.map((c) => ({
            ...c,
            category: columns.includes(c.category)
              ? c.category
              : "Your Prospect Files",
          }))
        );
      }

      const savedLogo = localStorage.getItem("companyLogo");
      if (savedLogo) setCompanyLogo(JSON.parse(savedLogo));

      const savedProfile = localStorage.getItem("agentProfile");
      if (savedProfile) setAgentProfile(JSON.parse(savedProfile));
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("clients", JSON.stringify(clients));
      if (companyLogo)
        localStorage.setItem("companyLogo", JSON.stringify(companyLogo));
      if (agentProfile)
        localStorage.setItem("agentProfile", JSON.stringify(agentProfile));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [clients, companyLogo, agentProfile]);

  const moveClient = (id: string, toColumn: Client["category"]) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              category: toColumn,
              status: toColumn === "Your Closed Sales" ? "Closed" : "Active",
            }
          : c
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setSelectedClient(null);
  };

  const handleAddClient = () => {
    const name = clientNameRef.current?.value.trim();
    if (!name) return;
    const newClient: Client = {
      id: Date.now().toString(),
      name,
      status: "Active",
      date: new Date().toISOString().split("T")[0],
      category: "Your Prospect Files",
    };
    setClients((prev) => [...prev, newClient]);
    if (clientNameRef.current) clientNameRef.current.value = "";
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
        setter({ src, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredClients = useMemo(
    () =>
      clients
        .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
          if (sortBy === "name") return a.name.localeCompare(b.name);
          if (sortBy === "date")
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          return a.status.localeCompare(b.status);
        }),
    [clients, search, sortBy]
  );

  const columns: Client["category"][] = [
    "Pro Sample Files",
    "Your Sample Files",
    "Your Prospect Files",
    "Your Closed Sales",
  ];

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <motion.aside
        animate={{ width: isCollapsed ? "4rem" : "30%" }}
        className="bg-white shadow-md p-4 rounded-xl"
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
              <div className="flex flex-col gap-2 mb-2">
                {companyLogo ? (
                  <Image
                    src={companyLogo.src}
                    alt="Company Logo"
                    width={300}
                    height={100}
                    className="object-contain w-full h-32"
                  />
                ) : (
                  <div className="h-16 w-full bg-gray-200 flex items-center justify-center">
                    No Logo
                  </div>
                )}
                <div className="flex w-full gap-2">
                  <Button asChild className="grow">
                    <label className="flex items-center gap-2 cursor-pointer">
                      Upload Logo
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setCompanyLogo)}
                        accept="image/*"
                      />
                    </label>
                  </Button>
                  {companyLogo && (
                    <Button
                      className="grow"
                      variant="outline"
                      onClick={() => setCompanyLogo(null)}
                    >
                      Delete
                      <Trash2 className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 mb-2">
                {agentProfile ? (
                  <Image
                    src={agentProfile.src}
                    alt="Agent Profile"
                    width={128}
                    height={128}
                    className="object-cover w-32 h-32 rounded-full"
                  />
                ) : (
                  <div className="h-16 w-full bg-gray-200 flex items-center justify-center">
                    No Profile Photo
                  </div>
                )}
                <div className="flex w-full gap-2">
                  <Button asChild className="grow">
                    <label className="flex items-center gap-2 cursor-pointer">
                      Upload Photo
                      <Upload className="h-4 w-4" />
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, setAgentProfile)}
                        accept="image/*"
                      />
                    </label>
                  </Button>
                  {agentProfile && (
                    <Button
                      className="grow"
                      variant="outline"
                      onClick={() => setAgentProfile(null)}
                    >
                      Delete
                      <Trash2 className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>

              {Object.entries(companyDetails).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <Label className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
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
                <Button onClick={() => setIsEditing(true)} disabled={isEditing}>
                  Edit
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  disabled={!isEditing}
                >
                  Save
                </Button>
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
                Request Additional Provider
              </Button>
            </div>
          </div>
        )}
      </motion.aside>

      <div className="flex-1 flex flex-col p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  Sample 1
                </Button>
                <Button variant="outline" className="w-full">
                  Sample 2
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Client</CardTitle>
            </CardHeader>
            <CardContent>
              <Input placeholder="Client Name" ref={clientNameRef} />
              <Button className="mt-2 w-full" onClick={handleAddClient}>
                Add Client
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-4 grow">
          <CardHeader>
            <CardTitle>IUL Client Files Without a Pension</CardTitle>
            <div className="flex gap-2 mt-2">
              {["New", "Open", "Copy", "Rename", "Delete"].map((action) => (
                <Button key={action} variant="outline" size="sm">
                  {action}
                </Button>
              ))}
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
              {columns.map((col) => (
                <Card key={col}>
                  <CardHeader>
                    <CardTitle>{col}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex grow">
                    <ClientColumn
                      status={col}
                      clients={filteredClients.filter(
                        (c) => c.category === col
                      )}
                      moveClient={moveClient}
                      onClientClick={setSelectedClient}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedClient && (
        <ClientDetailsModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onDelete={() => deleteClient(selectedClient.id)}
        />
      )}
    </div>
  );
}

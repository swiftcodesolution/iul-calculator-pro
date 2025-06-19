// src/components/InsuranceCompaniesSection.tsx
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface InsuranceCompany {
  id: string;
  name: string;
  website?: string;
}

export default function InsuranceCompaniesSection() {
  const { data: session } = useSession();
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const response = await fetch("/api/insurance-companies");
        if (!response.ok) throw new Error("Failed to fetch companies");
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError("Error loading companies");
        console.error(err);
      }
    }
    fetchCompanies();
  }, []);

  const handleInsuranceClick = (company: string) => {
    console.log(`Clicked on insurance company: ${company}`);
  };

  const handleSubmitRequest = async () => {
    if (!name) {
      setError("Name is required");
      return;
    }
    if (!session?.user?.id) {
      setError("Please log in to submit a request");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/insurance-company-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, website }),
      });
      if (!response.ok) throw new Error("Failed to submit request");
      setName("");
      setWebsite("");
      setOpen(false);
      setError(null);
    } catch (err) {
      setError("Error submitting request");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex-1 p-2 gap-2 mb-2">
      <CardContent className="p-0 space-y-2 h-full">
        <h3 className="font-bold text-sm">List of the Insurance Companies</h3>
        {error && <p className="text-red-500">{error}</p>}
        <motion.div
          className="flex flex-wrap gap-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
        >
          {companies.map((company) => (
            <motion.div
              key={company.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { type: "spring", stiffness: 120 },
                },
              }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="text-sm px-2 py-1 hover:bg-gray-100 transition-colors"
                onClick={() => handleInsuranceClick(company.name)}
              >
                {company.name}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <motion.div
              whileHover={{
                scale: 1.02,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="default" size="sm" className="w-full">
                Request Provider
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request New Insurance Company</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Company Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Website (optional)"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleSubmitRequest} disabled={loading}>
                  {loading ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setName("");
                    setWebsite("");
                    setOpen(false);
                    setError(null);
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
              {error && <p className="text-red-500">{error}</p>}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

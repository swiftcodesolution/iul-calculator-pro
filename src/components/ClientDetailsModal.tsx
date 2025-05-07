// src/components/ClientDetailsModal.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Client = {
  id: string;
  name: string;
  status: "Active" | "Closed";
  date: string;
};

type ClientDetailsModalProps = {
  client: Client;
  onClose: () => void;
  onDelete: () => void;
};

export default function ClientDetailsModal({
  client,
  onClose,
  onDelete,
}: ClientDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Client Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {client.name}
            </p>
            <p>
              <strong>Status:</strong> {client.status}
            </p>
            <p>
              <strong>Date:</strong> {client.date}
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

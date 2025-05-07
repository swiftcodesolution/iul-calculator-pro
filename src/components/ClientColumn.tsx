// src/components/ClientColumn.tsx
"use client";

import { useDrop } from "react-dnd";
import { useRef } from "react";
import ClientItem from "./ClientItem";

type Client = {
  id: string;
  name: string;
  status: "Active" | "Closed";
  date: string;
};

type ClientColumnProps = {
  status: string;
  clients: Client[];
  moveClient: (id: string, toColumn: string) => void;
  onClientClick: (client: Client) => void;
  allowDrop?: boolean;
};

export default function ClientColumn({
  status,
  clients,
  moveClient,
  onClientClick,
  allowDrop = true,
}: ClientColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: "client",
    drop: (item: { id: string }) => {
      if (allowDrop) moveClient(item.id, status);
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
    canDrop: () => allowDrop,
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={`p-2 ${
        isOver && allowDrop ? "bg-gray-200" : "bg-gray-100"
      } rounded`}
    >
      <div className="space-y-2">
        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => onClientClick(client)}
            className="cursor-pointer"
          >
            <ClientItem client={client} />
          </div>
        ))}
      </div>
    </div>
  );
}

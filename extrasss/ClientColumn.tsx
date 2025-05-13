"use client";

import { useDrop } from "react-dnd";
import ClientItem from "./ClientItem";
import { useRef } from "react";

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

type ClientColumnProps = {
  status: Client["category"];
  clients: Client[];
  moveClient: (id: string, toColumn: Client["category"]) => void;
  onClientClick: (client: Client) => void;
};

export default function ClientColumn({
  status,
  clients,
  moveClient,
  onClientClick,
}: ClientColumnProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "client",
    drop: (item: { id: string }) => {
      moveClient(item.id, status);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      className={`transition-all duration-300 p-2 rounded flex flex-col gap-2 grow border-2 ${
        isOver && canDrop
          ? "bg-gray-100 border-gray-100"
          : "bg-gray-100 border-gray-100"
      }`}
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

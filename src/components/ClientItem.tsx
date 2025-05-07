// src/components/ClientItem.tsx
"use client";

import { useDrag } from "react-dnd";
import { useRef } from "react";

type Client = {
  id: string;
  name: string;
  status: "Active" | "Closed";
  date: string;
};

type ClientItemProps = { client: Client };

export default function ClientItem({ client }: ClientItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: "client",
    item: { id: client.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  drag(ref);

  return (
    <div
      ref={ref}
      className={`p-2 bg-white rounded shadow-sm ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {client.name}
    </div>
  );
}

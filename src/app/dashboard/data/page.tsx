"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DataPage() {
  // Placeholder data for 401k and IUL (simulated from Page 2 and PDF import)
  const data = Array.from({ length: 80 }, (_, i) => ({
    year: 2025 + i,
    age: 40 + i,
    "401k Value": Math.round(100000 * Math.pow(1.063, i)).toLocaleString(),
    "IUL Value": Math.round(100000 * Math.pow(1.063, i) * 1.5).toLocaleString(),
    "401k Income": Math.round(4000 * Math.pow(1.02, i)).toLocaleString(),
    "IUL Income": Math.round(4000 * Math.pow(1.02, i) * 1.5).toLocaleString(),
  })).slice(0, 79); // Up to age 119 (40 + 79 = 119)

  return (
    <div className="min-h-[calc(100vh-8rem)] p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Year-by-Year Calculations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>401k Value</TableHead>
                <TableHead>IUL Value</TableHead>
                <TableHead>401k Income</TableHead>
                <TableHead>IUL Income</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.year}</TableCell>
                  <TableCell>{row.age}</TableCell>
                  <TableCell>{row["401k Value"]}</TableCell>
                  <TableCell>{row["IUL Value"]}</TableCell>
                  <TableCell>{row["401k Income"]}</TableCell>
                  <TableCell>{row["IUL Income"]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

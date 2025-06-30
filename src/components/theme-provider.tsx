"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      themes={["light", "dark", "high-contrast", "retro-cyberpunk", "system"]}
      defaultTheme="system"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

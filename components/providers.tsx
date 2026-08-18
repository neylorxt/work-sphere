"use client";

import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { StoreProvider } from "@/lib/store";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <SonnerToaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{ duration: 3500 }}
          />
        </TooltipProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
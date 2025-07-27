"use client";

import { WebSocketProvider } from "@/context/web-socket-context";
import useUser from "@/hooks/useUser";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";
import { Toaster } from "sonner";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWithWebSocket>{children}</ProviderWithWebSocket>
      <Toaster />
    </QueryClientProvider>
  );
};

const ProviderWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();
  if (isLoading) return null;
  return (
    <>
      {user && <WebSocketProvider user={user}>{children}</WebSocketProvider>}
      {!user && children}
    </>
  );
};

export default Provider;

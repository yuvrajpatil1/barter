"use client";

import { WebSocketProvider } from "@/context/web-socket-context";
import useSeller from "@/hooks/useSeller";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState } from "react";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ProviderWithWebSocket>{children}</ProviderWithWebSocket>
    </QueryClientProvider>
  );
};

const ProviderWithWebSocket = ({ children }: { children: React.ReactNode }) => {
  const { seller, isLoading } = useSeller();
  if (isLoading) return null;
  return (
    <>
      {seller && (
        <WebSocketProvider seller={seller}>{children}</WebSocketProvider>
      )}
      {!seller && children}
    </>
  );
};

export default Provider;

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: (failureCount, error) => {
              if (
                error instanceof Error &&
                error.message.includes("Unauthorized")
              ) {
                return false;
              }
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: false, // Desabilitar retry para mutations
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default ReactQueryProvider;

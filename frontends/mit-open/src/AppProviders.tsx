import React, { StrictMode } from "react"
import { HelmetProvider } from "react-helmet-async"

import { RouterProvider } from "react-router-dom"
import type { RouterProviderProps } from "react-router-dom"

import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "ol-design"
import { Provider as NiceModalProvider } from "@ebay/nice-modal-react"

interface AppProps {
  router: RouterProviderProps["router"]
  queryClient: QueryClient
}

/**
 * Renders child with Router, QueryClientProvider, and other such context provides.
 */
const AppProviders: React.FC<AppProps> = ({ router, queryClient }) => {
  return (
    <StrictMode>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <NiceModalProvider>
              <RouterProvider router={router} />
            </NiceModalProvider>
          </HelmetProvider>
          <ReactQueryDevtools
            initialIsOpen={false}
            toggleButtonProps={{ style: { opacity: 0.5 } }}
          />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

export { AppProviders }

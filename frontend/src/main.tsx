import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { config } from "./config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner"
import "./index.css";
import {App} from "./App.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <App />
                <Toaster/>
            </QueryClientProvider>
        </WagmiProvider>
    </StrictMode>
);

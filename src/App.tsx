import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainThemeProvider } from "@/contexts/MainThemeContext";
import { FixishProvider } from "@/contexts/FixishProvider";
import LiveRepair from "./pages/LiveRepair";
import Steps from "./pages/Steps";
import MeshViewer from "./pages/MeshViewer";
import SceneGraphPage from "./pages/SceneGraphPage";
import Diagnostics from "./pages/Diagnostics";
import HelpCenter from "./pages/HelpCenter";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <MainThemeProvider>
        <FixishProvider backendUrl="https://operations-english-relates-invited.trycloudflare.com">
          <Routes>
            <Route path="/" element={<LiveRepair />} />
            <Route path="/live" element={<LiveRepair />} />
            <Route path="/steps" element={<Steps />} />
            <Route path="/mesh" element={<MeshViewer />} />
            <Route path="/scene" element={<SceneGraphPage />} />
            <Route path="/diag" element={<Diagnostics />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </FixishProvider>
      </MainThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;

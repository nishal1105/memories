
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MemoryProvider } from "./context/MemoryContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateMemory from "./pages/CreateMemory";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import MemoryDetail from "./pages/MemoryDetail";
import EditMemory from "./pages/EditMemory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <MemoryProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/create" element={<CreateMemory />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/memory/:id" element={<MemoryDetail />} />
              <Route path="/edit/:id" element={<EditMemory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </MemoryProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

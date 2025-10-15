import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Audit from "./pages/Audit";
import CreateRequest from "./pages/CreateRequest";
import EmailPreview from "./pages/EmailPreview";
import ServiceSuggestions from "./pages/ServiceSuggestions";
import Contact from "./pages/Contact";
import AdminSetup from "./pages/AdminSetup";
import ProfileCompletion from "./pages/ProfileCompletion";
import AdminRequestChat from "./pages/AdminRequestChat";
import AdminQuote from "./pages/AdminQuote";
import AdminIntervention from "./pages/AdminIntervention";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/email-preview" element={<EmailPreview />} />
            <Route path="/service-suggestions" element={<ServiceSuggestions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route path="/profile-completion" element={<ProfileCompletion />} />
              <Route path="/admin/request/:requestId" element={<AdminRequestChat />} />
              <Route path="/admin/quote/:requestId" element={<AdminQuote />} />
              <Route path="/admin/intervention/:requestId" element={<AdminIntervention />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

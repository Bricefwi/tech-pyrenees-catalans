import AnalyzeSpecs from "./pages/AnalyzeSpecs";
import AnalysesHistory from "./pages/AnalysesHistory";
import AdminProjectsDashboard from "./pages/AdminProjectsDashboard";
import ProjectDetail from "./pages/ProjectDetail";
import AdminEmailLogs from "./pages/AdminEmailLogs";
import AdminPreReception from "./pages/AdminPreReception";
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
import AdminProposal from "./pages/AdminProposal";
import AdminQuote from "./pages/AdminQuote";
import AdminIntervention from "./pages/AdminIntervention";
import FAQPage from "./pages/FAQ";
import CGU from "./pages/CGU";
import CGV from "./pages/CGV";
import Brand from "./pages/Brand";
import AdminAudits from "./pages/AdminAudits";
import AdminQuotes from "./pages/AdminQuotes";
import AdminInterventions from "./pages/AdminInterventions";
import AdminFollowups from "./pages/AdminFollowups";
import ClientQuotes from "./pages/ClientQuotes";
import ClientProjects from "./pages/ClientProjects";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen w-full">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/client-dashboard" element={<ClientDashboard />} />
              <Route path="/audit" element={<Audit />} />
              <Route path="/aperçu-email" element={<EmailPreview />} />
              <Route path="/create-request" element={<CreateRequest />} />
            <Route path="/email-preview" element={<EmailPreview />} />
            <Route path="/service-suggestions" element={<ServiceSuggestions />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin-setup" element={<AdminSetup />} />
              <Route path="/profile-completion" element={<ProfileCompletion />} />
              <Route path="/admin/request/:requestId" element={<AdminRequestChat />} />
              <Route path="/admin/proposal/:requestId" element={<AdminProposal />} />
              <Route path="/admin/quote/:requestId" element={<AdminQuote />} />
              <Route path="/admin/intervention/:requestId" element={<AdminIntervention />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/cgu" element={<CGU />} />
              <Route path="/cgv" element={<CGV />} />
              <Route path="/brand" element={<Brand />} />
              <Route path="/analyze" element={<AnalyzeSpecs />} />
              <Route path="/analyses-history" element={<AnalysesHistory />} />
              <Route path="/admin-projects" element={<AdminProjectsDashboard />} />
              <Route path="/admin-projects/:projectId" element={<ProjectDetail />} />
              <Route path="/admin/email-logs" element={<AdminEmailLogs />} />
              <Route path="/admin/journaux-de-courrier" element={<AdminEmailLogs />} />
              <Route path="/admin/pre-reception" element={<AdminPreReception />} />
              <Route path="/admin/audits" element={<AdminAudits />} />
              <Route path="/admin/quotes" element={<AdminQuotes />} />
              <Route path="/admin/interventions" element={<AdminInterventions />} />
              <Route path="/admin/followups" element={<AdminFollowups />} />
              <Route path="/admin/suivis" element={<AdminFollowups />} />
              <Route path="/admin/projects" element={<AdminProjectsDashboard />} />
              <Route path="/client/quotes" element={<ClientQuotes />} />
              <Route path="/client/projects" element={<ClientProjects />} />
              <Route path="/client/tableau-de-bord" element={<ClientDashboard />} />
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

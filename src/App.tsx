import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MoodProvider } from "@/contexts/MoodContext";
import Navbar from "@/components/Navbar";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import DailyCheckIn from "./pages/DailyCheckIn";
import Dashboard from "./pages/Dashboard";
import MindscapePage from "./pages/MindscapePage";
import JournalPage from "./pages/JournalPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <MoodProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/daily" element={<DailyCheckIn />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mindscape" element={<MindscapePage />} />
            <Route path="/journal" element={<JournalPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MoodProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

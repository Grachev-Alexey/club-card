import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DigitalCardPage from "@/pages/digital-card";
import MasterPage from "@/pages/master";
import MasterVisitPage from "@/pages/master-visit";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/card/:clientId" component={DigitalCardPage} />
      <Route path="/master/:clientId" component={MasterVisitPage} />
      <Route path="/master" component={MasterPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen premium-dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

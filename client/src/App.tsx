
import { Router, Route, Switch } from "wouter";
import { Toaster } from "./components/ui/toaster";

// Import pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Discover from "./pages/Discover";
import ModelProfile from "./pages/ModelProfile";
import ModelDashboard from "./pages/ModelDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Messages from "./pages/Messages";
import Favorites from "./pages/Favorites";
import ScheduledCalls from "./pages/ScheduledCalls";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/not-found";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={Auth} />
        <Route path="/discover" component={Discover} />
        <Route path="/model/:id" component={ModelProfile} />
        <Route path="/messages">
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        </Route>
        <Route path="/favorites">
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        </Route>
        <Route path="/scheduled-calls">
          <ProtectedRoute>
            <ScheduledCalls />
          </ProtectedRoute>
        </Route>
        <Route path="/model-dashboard">
          <ProtectedRoute requiredRole="model">
            <ModelDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin">
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </Router>
  );
}

export default App;

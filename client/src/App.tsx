import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthGuard } from "./guards/AuthGuard";
import { Shell } from "./components/layout/Shell";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Vehicles } from "./pages/Vehicles";
import { Drivers } from "./pages/Drivers";
import { Trips } from "./pages/Trips";
import { Maintenance } from "./pages/Maintenance";
import { FuelExpenses } from "./pages/FuelExpenses";
import { Reports } from "./pages/Reports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<AuthGuard />}>
              <Route element={<Shell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/vehicles" element={<Vehicles />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/fuel-expenses" element={<FuelExpenses />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
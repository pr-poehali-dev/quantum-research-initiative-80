import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CityProvider } from "@/context/CityContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Prices from "@/pages/Prices";
import Order from "@/pages/Order";
import Login from "@/pages/Login";
import Cabinet from "@/pages/Cabinet";
import Loyalty from "@/pages/Loyalty";
import Admin from "@/pages/Admin";
import Contacts from "@/pages/Contacts";
import About from "@/pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <CityProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/prices" element={<Prices />} />
                    <Route path="/order" element={<Order />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cabinet" element={<Cabinet />} />
                    <Route path="/cabinet/orders" element={<Cabinet />} />
                    <Route path="/cabinet/bonuses" element={<Cabinet />} />
                    <Route path="/loyalty" element={<Loyalty />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/services" element={<Prices />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </CityProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

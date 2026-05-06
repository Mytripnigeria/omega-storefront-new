import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { StorefrontProvider } from "@/context/StorefrontContext";
import { MenuProvider } from "@/context/MenuContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { StorefrontGate } from "@/components/StorefrontGate";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Referrals from "./pages/Referrals";
import PaymentMethods from "./pages/PaymentMethods";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Page from "./pages/Page";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/order-tracking/:id" element={<OrderTracking />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/referrals" element={<Referrals />} />
        <Route path="/payment-methods" element={<PaymentMethods />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/p/:slug" element={<Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <StorefrontProvider>
        <AuthProvider>
          <CartProvider>
            <MenuProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner position="top-center" />
                <BrowserRouter>
                  <ScrollToTop />
                  <StorefrontGate>
                    <AnimatedRoutes />
                  </StorefrontGate>
                </BrowserRouter>
              </TooltipProvider>
            </MenuProvider>
          </CartProvider>
        </AuthProvider>
      </StorefrontProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

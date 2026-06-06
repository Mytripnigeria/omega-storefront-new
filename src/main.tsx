import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ensureBusinessId } from "@/lib/business";

// Resolve the businessId (env or custom-domain lookup) before the app mounts so
// every data fetch carries the right tenant id.
void ensureBusinessId().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});

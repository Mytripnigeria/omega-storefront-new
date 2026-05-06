import type { ReactNode } from "react";
import { useStorefront } from "@/context/StorefrontContext";

export function StorefrontGate({ children }: { children: ReactNode }) {
  const { config, isLoading } = useStorefront();

  if (isLoading) return <>{children}</>;

  if (config && config.storeStatus !== "live") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md text-center space-y-3">
          <div className="text-5xl">{config.storeStatus === "maintenance" ? "🛠️" : "🔒"}</div>
          <h1 className="text-2xl font-semibold">
            {config.storeStatus === "maintenance"
              ? "We'll be right back"
              : "Currently offline"}
          </h1>
          <p className="text-muted-foreground">
            {config.maintenanceMessage ??
              (config.storeStatus === "maintenance"
                ? "We're making things better. Please check back soon."
                : `${config.storeName || "Our store"} is not accepting orders right now.`)}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

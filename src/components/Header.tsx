import { useNavigate } from "react-router-dom";
import { useStorefront } from "@/context/StorefrontContext";
import logo from "@/assets/logo.png";

export const Header = () => {
  const navigate = useNavigate();
  const { config } = useStorefront();

  const storeName = config?.storeName || "Mr. Jollof";
  const logoUrl = config?.logoUrl || logo;

  return (
    <header className="bg-background border-b border-border">
      <div className="container flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logoUrl} alt={storeName} className="h-10 w-auto" />
        </div>
      </div>
    </header>
  );
};

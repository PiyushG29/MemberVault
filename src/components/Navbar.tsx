import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Crown, LogOut, User, Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut, subscription, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-accent" />
          <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            MemberVault
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <a 
            href="#pricing" 
            onClick={handlePricingClick}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Pricing
          </a>
          {user && (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              {subscription.subscribed && (
                <Link to="/members" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Members Area</Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-1 text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors">
                  <ShieldCheck className="h-4 w-4" /> Admin
                </Link>
              )}
            </>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              {subscription.subscribed && (
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent capitalize">
                  {subscription.tier} Plan
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <User className="mr-1 h-4 w-4" /> Profile
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Login</Button>
              <Button size="sm" onClick={() => navigate("/auth?tab=register")} className="bg-accent text-accent-foreground hover:bg-accent/90">
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card p-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Home</Link>
            <a 
              href="#pricing" 
              onClick={handlePricingClick}
              className="text-sm font-medium cursor-pointer"
            >
              Pricing
            </a>
            {user && (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Dashboard</Link>
                {subscription.subscribed && (
                  <Link to="/members" onClick={() => setMobileOpen(false)} className="text-sm font-medium">Members Area</Link>
                )}
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-1 text-sm font-medium text-purple-500">
                    <ShieldCheck className="h-4 w-4" /> Admin
                  </Link>
                )}
              </>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={() => { signOut(); setMobileOpen(false); }}>Logout</Button>
            ) : (
              <Button size="sm" onClick={() => { navigate("/auth"); setMobileOpen(false); }} className="bg-accent text-accent-foreground">Login / Register</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Crown } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
});

const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().max(20).optional(),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else navigate("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ email, password, fullName, phone });
    if (!parsed.success) { toast.error(parsed.error.errors[0].message); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Account created! Redirecting...");
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Crown className="mx-auto h-10 w-10 text-accent" />
          <h1 className="mt-4 text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            {tab === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {tab === "login" ? "Sign in to your account" : "Join MemberVault today"}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-card">
          <div className="mb-6 flex rounded-lg bg-muted p-1">
            <button
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${tab === "login" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${tab === "register" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
              onClick={() => setTab("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="space-y-4">
            {tab === "register" && (
              <>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
              {loading ? "Please wait..." : tab === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

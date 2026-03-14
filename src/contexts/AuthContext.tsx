import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { TierKey } from "@/lib/membership";

interface SubscriptionInfo {
  subscribed: boolean;
  tier: TierKey | null;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  subscription: SubscriptionInfo;
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    subscribed: false,
    tier: null,
    subscriptionEnd: null,
  });

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscription({
        subscribed: data.subscribed,
        tier: (data.tier as TierKey) ?? null,
        subscriptionEnd: data.subscription_end ?? null,
      });
    } catch {
      setSubscription({ subscribed: false, tier: null, subscriptionEnd: null });
    }
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("user_id", userId)
      .single();
    setIsAdmin(data?.is_admin === true);
  };

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setTimeout(() => {
            checkSubscription();
            checkAdmin(session.user.id);
          }, 0);
        } else {
          setSubscription({ subscribed: false, tier: null, subscriptionEnd: null });
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkSubscription();
        checkAdmin(session.user.id);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin, subscription, checkSubscription, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

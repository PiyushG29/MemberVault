import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, TrendingUp, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  is_admin?: boolean;
  created_at: string;
  email?: string;
  plan?: string;
  tier?: string;
  subscribed?: boolean;
}

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-list-members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      } else {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        setMembers(profiles || []);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = members.filter(
    (m) =>
      (m.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (m.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const totalMembers = members.length;
  const subscribedCount = members.filter((m) => m.subscribed).length;
  const basicCount = members.filter((m) => m.tier === "basic" && m.subscribed).length;
  const premiumCount = members.filter((m) => m.tier === "premium" && m.subscribed).length;

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage all members and subscriptions</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Members</span>
            </div>
            <p className="text-3xl font-bold">{totalMembers}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-green-500" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Subscribed</span>
            </div>
            <p className="text-3xl font-bold text-green-500">{subscribedCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {/* Members Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No members found.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">#</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Role</th>
                    <th className="text-left px-6 py-4 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((member, idx) => (
                    <tr
                      key={member.id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 text-muted-foreground">{idx + 1}</td>
                      <td className="px-6 py-4 font-medium">
                        {member.full_name || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {member.email || "—"}
                      </td>
                      <td className="px-6 py-4">
                        {member.tier || member.plan ? (
                          <Badge
                            className={
                              (member.tier || member.plan) === "premium"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            }
                          >
                            {((member.tier || member.plan) ?? "").charAt(0).toUpperCase() + 
                             ((member.tier || member.plan) ?? "").slice(1)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            member.subscribed
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }
                        >
                          {member.subscribed ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {member.is_admin ? (
                          <Badge className="bg-accent/10 text-accent border-accent/20">
                            Admin
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">Member</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(member.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Showing {filtered.length} of {totalMembers} members
        </p>
      </div>
    </div>
  );
}
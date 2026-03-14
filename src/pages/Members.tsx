import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";


const resources = [
  { icon: "/book.png", title: "Growth Playbook", desc: "A comprehensive guide to personal and professional development.", tag: "eBook" },
  { icon: "/masterclass.png", title: "Masterclass Series", desc: "Exclusive video tutorials from industry leaders.", tag: "Video" },
  { icon: "/template.png", title: "Templates & Frameworks", desc: "Ready-to-use business and productivity templates.", tag: "Download" },
  { icon: "/community.png", title: "Community Forum", desc: "Connect and discuss with fellow members.", tag: "Community" },
];

export default function Members() {
  const { subscription, loading } = useAuth();

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">Loading...</div>;

  if (!subscription.subscribed) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 flex items-center gap-3">
        <div className="rounded-xl p-3">
          <img src="/lock.png" alt="Members Only" className="h-10 w-10 object-contain" />
        </div>
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Members Only Area
          </h1>
          <p className="text-muted-foreground">Exclusive content for subscribed members</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {resources.map(({ icon, title, desc, tag }) => (
          <div key={title} className="group rounded-2xl border bg-card p-6 shadow-card transition-all hover:shadow-card-hover">
            <div className="flex items-start justify-between">
              <div className="rounded-xl p-6">
                <img src={icon} alt={title} className="h-10 w-10 object-contain" />
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{tag}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
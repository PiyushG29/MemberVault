import {
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PricingCard from "@/components/PricingCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

/* -------------------- Feature Carousel Component -------------------- */
function FeatureCarousel() {
  const slides = [
    {
      icon: "/shield.png",
      title: "Secure & Private",
      desc: "Enterprise-grade security with Stripe-powered payments and encrypted data.",
    },
    {
      icon: "/people.png",
      title: "Exclusive Community",
      desc: "Connect with like-minded professionals in our private member forum.",
    },
    {
      icon: "/instant.png",
      title: "Instant Access",
      desc: "Get immediate access to all resources the moment you subscribe.",
    },
    {
      icon: "/chart.png",
      title: "Growth Tracking",
      desc: "Monitor your progress with comprehensive analytics and insights.",
    },
    {
      icon: "/rocket.png",
      title: "Launch Faster",
      desc: "Accelerate your journey with proven strategies and expert guidance.",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrent((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Card with smooth transitions */}
      <div className={`bg-card border border-accent/20 rounded-3xl p-12 text-center shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-accent/40 ${
        mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>

        {/* Icon with animation */}
        <div className={`flex justify-center mb-8 transition-all duration-700 transform ${
          mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}>
          <div className="relative w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center group hover:bg-accent/20 transition-all duration-300">
            <img 
              src={slides[current].icon} 
              alt={slides[current].title}
              className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-semibold mb-4 transition-all duration-500">
          {slides[current].title}
        </h3>

        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-base md:text-lg transition-all duration-500">
          {slides[current].desc}
        </p>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 md:-translate-x-16 bg-slate-800 hover:bg-accent text-white p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 md:translate-x-16 bg-slate-800 hover:bg-accent text-white p-3 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="font-medium">
          <span className="text-accent font-bold text-lg">{current + 1}</span>
          <span className="text-slate-500 text-lg"> / {slides.length}</span>
        </p>
      </div>

      {/* Dot Indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current
                ? "w-8 bg-accent"
                : "w-2 bg-slate-600 hover:bg-slate-500"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- Main Page -------------------- */
export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col">

      {/* -------------------- Hero Section -------------------- */}
      <section className="bg-hero relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(42_90%_55%/0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">

                        <div
              className={`mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm transition-all duration-700 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-4"
              }`}
            >
              <Crown className="h-4 w-4 text-accent animate-pulse" />
              <span className="text-white">Premium Membership Platform</span>
            </div>

                        <h1
              className={`text-4xl font-bold md:text-6xl transition-all duration-1000 delay-100 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-white">Unlock Your Full</span>
              <span className="text-gradient-gold block mt-2">
                Potential Today
              </span>
            </h1>

            <p className={`mx-auto mt-6 max-w-xl text-lg text-primary-foreground/70 transition-all duration-1000 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Join an exclusive community of professionals. Access premium resources, mentoring,
              and tools to accelerate your growth.
            </p>

            <div className={`mt-10 flex justify-center gap-4 transition-all duration-1000 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-base px-8 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() =>
                  navigate(user ? "/dashboard" : "/auth?tab=register")
                }
              >
                {user ? "Go to Dashboard" : "Start Free Trial"}
              </Button>

              <Button
                size="lg"
                className="bg-green-600 text-white hover:bg-green-700 text-base px-8 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() =>
                  document
                    .getElementById("pricing")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------- Features Section -------------------- */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2
            className={`text-3xl font-bold md:text-4xl mb-12 transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            Why Join <span className="text-gradient-gold">MemberVault</span>?
          </h2>

          <FeatureCarousel />
        </div>
      </section>

      {/* -------------------- Pricing Section -------------------- */}
      <section id="pricing" className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl mb-4">
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground mb-10">
            Select the membership that fits your needs.
          </p>

          <div className="grid max-w-3xl mx-auto gap-8 md:grid-cols-2">
            <PricingCard tierKey="basic" />
            <PricingCard tierKey="premium" />
          </div>
        </div>
      </section>

      {/* -------------------- Footer -------------------- */}
      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        <div className="flex justify-center items-center gap-2 mb-2">
          <Crown className="h-4 w-4 text-accent" />
          <span className="font-semibold text-foreground">
            MemberVault
          </span>
        </div>
        <p>© 2026 Piyush. All rights reserved. Powered by Stripe (Test Mode).</p>
      </footer>
    </div>
  );
}
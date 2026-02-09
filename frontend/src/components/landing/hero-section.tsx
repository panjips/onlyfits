import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] flex items-center">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-primary font-medium mb-4 tracking-wide">
            AI-Powered Gym Management
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Run your gym smarter,{" "}
            <span className="text-primary">not harder</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-2xl">
            Onlyfits helps gym owners streamline operations with intelligent
            wellness analysis and an AI assistant that understands your
            business. Less admin work, more time for what matters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="group" asChild>
              <Link to="/register">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:demo@onlyfits.com">Book a Demo</a>
            </Button>
          </div>
          <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>14-day free trial</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-2/3 bg-linear-to-l from-lightprimary/50 to-transparent rounded-l-full blur-3xl pointer-events-none hidden lg:block" />
    </section>
  );
}

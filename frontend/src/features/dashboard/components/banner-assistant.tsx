import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Bot, Sparkles, ArrowRight } from "lucide-react";

export const BannerAssistant = () => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-violet-600 to-indigo-600 p-6 sm:p-8 text-white shadow-lg">
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-indigo-100 font-medium text-sm mb-1">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/30 ring-1 ring-indigo-400/50">
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            </span>
            <span>New Feature Available</span>
          </div>
          
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Meet Your New AI Gym Assistant
          </h3>
          
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Get personalized workout plans, diet recommendations, and real-time progress tracking powered by advanced AI.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Button 
            asChild 
            size="lg" 
            className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-semibold shadow-md border-0"
          >
            <Link to="/analyze">
              Try Assistant Now
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-indigo-900/20 rounded-full blur-2xl"></div>
      
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10 mix-blend-overlay"></div>
      
      <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block opacity-10 rotate-12 transform">
        <Bot className="w-48 h-48 text-white" />
      </div>
    </div>
  );
};

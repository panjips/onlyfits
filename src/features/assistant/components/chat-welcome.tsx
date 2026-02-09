import { Bot, Sparkles, Dumbbell, Apple, Moon } from "lucide-react";

export const ChatWelcome = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
          <Bot className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-success text-white flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">
        Onlyfits Assistant
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Your AI-powered fitness companion. Ask me about workouts, nutrition,
        recovery tips, or get personalized recommendations based on your
        activity!
      </p>

      <div className="grid gap-3 max-w-lg w-full">
        <SuggestionCard
          icon={Dumbbell}
          title="Workout Suggestions"
          description="Get personalized workout recommendations"
        />
        <SuggestionCard
          icon={Apple}
          title="Nutrition Tips"
          description="Learn about healthy eating habits"
        />
        <SuggestionCard
          icon={Moon}
          title="Recovery Advice"
          description="Optimize your rest and recovery"
        />
      </div>
    </div>
  );
};

interface SuggestionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const SuggestionCard = ({
  icon: Icon,
  title,
  description,
}: SuggestionCardProps) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="text-left">
        <p className="font-medium text-sm text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

import { Bot, LineChart, Shield, Zap } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 border border-border rounded-lg hover:border-primary/30 transition-colors">
      <div className="w-10 h-10 rounded-md bg-lightprimary flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

const features = [
  {
    icon: <LineChart className="w-5 h-5" />,
    title: "AI Wellness Analysis",
    description:
      "Track and analyze member health metrics with intelligent insights. Get personalized recommendations based on individual progress and goals.",
  },
  {
    icon: <Bot className="w-5 h-5" />,
    title: "AI Assistant Chat",
    description:
      "24/7 intelligent support for your staff and members. Answer questions, book sessions, and provide workout guidance instantly.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Streamlined Operations",
    description:
      "Automate membership management, scheduling, and billing. Spend less time on admin work and more time growing your business.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Secure & Reliable",
    description:
      "Enterprise-grade security for your gym data. GDPR compliant with encrypted storage and regular backups.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-medium mb-2">Features</p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Everything you need to run your gym
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed specifically for gym owners who want to
            modernize their operations and deliver better member experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

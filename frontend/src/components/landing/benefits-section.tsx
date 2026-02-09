import { CheckCircle } from "lucide-react";

const benefits = [
  "Reduce administrative overhead by 60%",
  "Real-time member analytics and insights",
  "Automated scheduling and class management",
  "AI-driven member retention predictions",
  "Seamless payment and billing integration",
  "24/7 AI assistant for member support",
];

export function BenefitsSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-semibold mb-6">
              Built for gym owners who value their time
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Stop wrestling with spreadsheets and outdated systems. Onlyfits
              gives you the tools to run your gym efficiently while focusing on
              what matters most — your members.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="bg-card border rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">
                  Monthly Overview
                </span>
                <span className="text-xs bg-lightsuccess text-success px-2 py-1 rounded-full">
                  +12% growth
                </span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Active Members
                    </span>
                    <span className="font-medium">847</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "85%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Class Attendance
                    </span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full"
                      style={{ width: "92%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Member Retention
                    </span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary rounded-full"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

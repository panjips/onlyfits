const steps = [
  {
    number: "01",
    title: "Connect Your Gym",
    description:
      "Set up your gym profile in minutes. Import existing member data or start fresh with our intuitive onboarding process.",
  },
  {
    number: "02",
    title: "Configure AI Features",
    description:
      "Customize the wellness analysis parameters and train the AI assistant with your gym's specific services and policies.",
  },
  {
    number: "03",
    title: "Launch & Grow",
    description:
      "Go live with your new system. Watch as automation handles the busywork while you focus on member success and business growth.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-medium text-primary">How It Works</p>
          <h2 className="mb-4 text-2xl font-semibold md:text-3xl">
            Get started in three simple steps
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            We&apos;ve made it easy to transition your gym to a smarter
            management system without disrupting your daily operations.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-px w-full bg-border md:block" />
              )}
              <div className="relative flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lightprimary">
                  <span className="text-xl font-bold text-primary">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-3 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

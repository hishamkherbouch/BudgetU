import Header from "@/components/landing/Header";
import AuthSignupButton from "@/components/auth/AuthSignupButton";
import Footer from "@/components/landing/Footer";

const features = [
  {
    title: "Budget planner",
    description:
      "Set your monthly income and see how much you have left to spend. BudgetU shows your budget remaining in real time so you can stay on track without the guesswork.",
  },
  {
    title: "Expense tracker",
    description:
      "Log expenses by category—food, rent, transport, and more. View a clear breakdown of where your money goes and add notes to remember what each charge was for.",
  },
  {
    title: "Savings goals",
    description:
      "Create goals for study abroad, emergencies, or anything else. Track progress and mark an emergency fund so you're always prepared for the unexpected.",
  },
  {
    title: "Spending insights",
    description:
      "Get simple insights on your spending habits, how close you are to your budget, and tips to improve. See which categories take the biggest share of your income.",
  },
  {
    title: "Category breakdown",
    description:
      "Visualize spending by category with progress bars and totals. Quickly spot which areas use the most of your budget so you can adjust before the month ends.",
  },
  {
    title: "Secure & simple",
    description:
      "Your data is stored securely and only you can see it. Sign up with email, set your income once in onboarding, and start tracking in minutes.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen w-full bg-budgetu-bg flex flex-col">
      <main className="w-full max-w-7xl mx-auto bg-budgetu-surface min-h-screen shadow-lg px-4 py-6 sm:px-6 md:px-10 md:py-8 flex-1">
        <Header />

        <section className="pt-4 pb-12">
          <h1 className="text-budgetu-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Everything you need to manage student finances
          </h1>
          <p className="text-budgetu-body text-lg max-w-2xl mb-10">
            BudgetU gives you the tools to track spending, plan your budget, and
            hit your savings goals—all in one place.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="border border-border rounded-xl p-6 bg-budgetu-surface-alt hover:border-budgetu-accent/30 transition-colors"
              >
                <h2 className="text-budgetu-heading text-xl font-bold mb-2">
                  {feature.title}
                </h2>
                <p className="text-budgetu-body text-sm leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <AuthSignupButton
              className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white font-semibold"
            >
              Get started for free
            </AuthSignupButton>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

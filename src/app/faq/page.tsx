import Link from "next/link";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "Is BudgetU really free?",
    answer:
      "Yes. BudgetU is free for all college students. We don’t charge subscription fees or hide features behind a paywall. Our goal is to help students build better money habits without adding another bill.",
  },
  {
    question: "Who can use BudgetU?",
    answer:
      "BudgetU is built for college students—undergrads, grad students, and anyone in school who wants to track spending, set a budget, and work toward savings goals. You just need a valid email to sign up.",
  },
  {
    question: "How do I set up my budget?",
    answer:
      "After you create an account, you’ll go through a short onboarding flow where you enter your monthly income (from jobs, financial aid, or family support). BudgetU uses that to show how much you have left to spend and how much you can save.",
  },
  {
    question: "Where is my data stored? Is it secure?",
    answer:
      "Your data is stored securely in the cloud. We use industry-standard practices to keep your information safe, and only you can see your expenses, budgets, and savings goals. We don’t sell your data.",
  },
  {
    question: "Can I use BudgetU on my phone?",
    answer:
      "You can use BudgetU in your phone’s browser—it’s responsive and works on any device. A dedicated mobile app may come later; for now, the web app works great on the go.",
  },
  {
    question: "What if I forget my password?",
    answer:
      "On the login page, use the “Forgot password?” link. You’ll get an email with a link to reset your password. If you don’t see it, check your spam folder.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen w-full bg-budgetu-bg flex flex-col">
      <main className="w-full max-w-7xl mx-auto bg-white min-h-screen shadow-lg px-6 py-6 md:px-10 md:py-8 flex-1">
        <Header />

        <section className="pt-4 pb-12">
          <h1 className="text-budgetu-heading text-3xl md:text-4xl font-bold mb-2">
            Frequently asked questions
          </h1>
          <p className="text-budgetu-body text-lg max-w-2xl mb-10">
            Quick answers about BudgetU and how it works. Can’t find what you
            need? Reach out and we’ll help.
          </p>

          <dl className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="border border-border rounded-xl p-6 bg-[#f9fafb]"
              >
                <dt className="text-budgetu-heading font-bold text-lg mb-2">
                  {faq.question}
                </dt>
                <dd className="text-budgetu-body text-sm leading-relaxed">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 text-center">
            <Button
              className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white font-semibold"
              asChild
            >
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

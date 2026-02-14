import { Button } from "@/components/ui/button";
import AuthSignupButton from "@/components/auth/AuthSignupButton";

export default function Hero() {
  return (
    <section className="text-center max-w-[640px] mx-auto mb-14">
      <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-budgetu-accent/12 text-budgetu-accent-deep text-sm font-semibold rounded-full mb-5">
        <span className="w-2 h-2 rounded-full bg-budgetu-accent" />
        Free for all college students
      </div>

      <h1 className="text-budgetu-heading text-[clamp(2rem,5vw,2.75rem)] font-bold leading-tight mb-4">
        Budget smarter in college
      </h1>

      <p className="text-budgetu-body text-[1.0625rem] leading-relaxed mb-7">
        Take control of your finances with smart expense tracking, easy bill
        splitting, and savings planning. Manage tuition, living costs, and daily
        spending all in one place.
      </p>

      <div className="flex flex-wrap justify-center gap-3.5">
        <AuthSignupButton
          size="lg"
          className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white font-semibold px-6 py-3.5 text-base"
        >
          Get started free
          <span className="ml-2">→</span>
        </AuthSignupButton>
        <Button
          variant="outline"
          size="lg"
          className="font-semibold px-6 py-3.5 text-base"
        >
          See how it works
        </Button>
      </div>
    </section>
  );
}

/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { createSavingsGoal } from "@/lib/savings-goals";
import type {
  EducationPersonalization,
  TopicPersonalization,
  EducationStatus,
} from "@/lib/education-personalization";

// ── Status badge styling ──────────────────────────────────────────────────────

function statusBadgeClass(status: EducationStatus): string {
  switch (status) {
    case "high_priority":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
    case "in_progress":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    case "complete":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  }
}

function StatusBadge({ topic }: { topic: TopicPersonalization }) {
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium px-2 py-0.5 ${statusBadgeClass(topic.status)}`}
    >
      {topic.status === "high_priority" && "⚠ "}
      {topic.status === "in_progress" && "● "}
      {topic.status === "complete" && "✓ "}
      {topic.statusLabel}
    </Badge>
  );
}

// ── Card definitions ──────────────────────────────────────────────────────────

type CardId =
  | "emergency-fund"
  | "high-yield-savings"
  | "roth-ira"
  | "401k"
  | "investing-stocks";

const cards: {
  id: CardId;
  title: string;
  tagline: string;
  personalizationKey: keyof EducationPersonalization | null;
  content: React.ReactNode;
}[] = [
  {
    id: "emergency-fund",
    title: "Emergency fund",
    tagline: "Your safety net for when life throws a curveball",
    personalizationKey: "emergencyFund",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> An
          emergency fund is money you set aside and don't touch unless something
          unexpected happens—a car repair, a medical bill, losing your on-campus
          job, or your laptop dying right before finals. It's not for concert
          tickets or a spring break trip; it's there so you don't have to put
          emergencies on a credit card or take out a high-interest loan.
        </p>
        <p>
          <strong className="text-budgetu-heading">
            Why it matters in college:
          </strong>{" "}
          Your income as a student is often irregular. One month you might have
          a refund or a paid internship; the next you're scraping by. Even a
          small emergency fund ($500–$1,000) can cover a flat tire, a doctor
          visit, or a flight home in a family emergency without wrecking your
          budget or your credit.
        </p>
        <p>
          <strong className="text-budgetu-heading">How much to save:</strong>{" "}
          Start with a goal that feels doable—maybe $500. Then aim for one month
          of your essential expenses. After graduation, many experts suggest
          building to 3–6 months of expenses. As a student, one month (or even a
          few hundred dollars) is a huge win.
        </p>
        <p>
          <strong className="text-budgetu-heading">Where to keep it:</strong>{" "}
          In a separate savings account—ideally a high-yield savings account so
          it earns a little interest. Keep it somewhere you can access within a
          day or two, but not so easy that you're tempted to dip in for
          non-emergencies.
        </p>
        <p>
          <strong className="text-budgetu-heading">How to build it:</strong>{" "}
          Automate it if you can: set up a small automatic transfer from checking
          to savings every payday or every month. Even $25 or $50 adds up. Put
          windfalls (tax refunds, birthday money, extra from a side gig) into the
          fund when you can.
        </p>
      </div>
    ),
  },
  {
    id: "high-yield-savings",
    title: "High-yield savings account (HYSA)",
    tagline: "Earn more on your savings with almost no extra effort",
    personalizationKey: "hysa",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> A
          high-yield savings account pays you a much higher interest rate than a
          typical big-bank savings account. At many traditional banks, savings
          accounts pay 0.01% or close to nothing. Top HYSAs often pay 4–5% or
          more. Your money is still FDIC insured, so it's very safe.
        </p>
        <p>
          <strong className="text-budgetu-heading">
            Why students should care:
          </strong>{" "}
          If you're building an emergency fund or saving for study abroad, a move
          after graduation, or a car, keeping that money in an HYSA means it
          grows a little every month instead of sitting there earning nothing.
        </p>
        <p>
          <strong className="text-budgetu-heading">Where to find them:</strong>{" "}
          Online banks and credit unions usually offer the best rates because they
          have lower overhead than brick-and-mortar banks. Look for no monthly
          fees, no minimum balance, and FDIC insurance.
        </p>
        <p>
          <strong className="text-budgetu-heading">How to use one:</strong> Open
          an HYSA and link it to your main checking account. Transfer money in
          when you get paid or when you have extra; transfer out when you have a
          real emergency or hit a savings goal. Use it for your emergency fund and
          any short-term goals (under about five years).
        </p>
      </div>
    ),
  },
  {
    id: "roth-ira",
    title: "Roth IRA",
    tagline:
      "Tax-free growth for retirement—especially powerful when you're young",
    personalizationKey: "rothIRA",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> A Roth
          IRA is an individual retirement account that you fund with money you've
          already paid taxes on. In return, the IRS lets your money grow
          tax-free, and when you take it out in retirement, you don't pay any tax
          on the gains.
        </p>
        <p>
          <strong className="text-budgetu-heading">
            Why it's great for students:
          </strong>{" "}
          When you're in college, you're often in a low tax bracket. That means
          the "cost" of putting after-tax money into a Roth is relatively low.
          Starting even small (e.g. $50 or $100 a month), decades of tax-free
          growth can turn that into a significant amount by retirement.
        </p>
        <p>
          <strong className="text-budgetu-heading">Rules to know:</strong> You
          can only contribute if you have "earned income"—wages, salary, or
          self-employment income. There's an annual contribution limit set by the
          IRS. You can't put in more than you earned that year.
        </p>
        <p>
          <strong className="text-budgetu-heading">Flexibility:</strong> You can
          withdraw the money you contributed (not the investment gains) at any
          time, for any reason, without taxes or penalties. So in a true
          emergency, your contributions can double as a last-resort safety net.
        </p>
        <p>
          <strong className="text-budgetu-heading">How to get started:</strong>{" "}
          Open a Roth IRA at a low-cost broker or robo-advisor. Choose simple
          investments like a target-date fund or a broad index fund. Set up
          automatic contributions from your checking account.
        </p>
      </div>
    ),
  },
  {
    id: "401k",
    title: "401(k)",
    tagline: "Employer retirement plans and why the match is free money",
    personalizationKey: "fourOhOneK",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> A 401(k)
          is a retirement account your employer offers. You choose to have a
          percentage or dollar amount taken from your paycheck and invested in
          funds you select. Many employers also offer a "match"—they'll add extra
          money to your 401(k) if you contribute, up to a certain limit.
        </p>
        <p>
          <strong className="text-budgetu-heading">
            Traditional vs. Roth 401(k):
          </strong>{" "}
          In a traditional 401(k), you contribute pre-tax money; you pay tax when
          you withdraw in retirement. In a Roth 401(k), you contribute after-tax
          money and qualified withdrawals are tax-free. For students in a low tax
          bracket, the Roth 401(k) can be especially attractive.
        </p>
        <p>
          <strong className="text-budgetu-heading">
            Why the match matters:
          </strong>{" "}
          An employer match is essentially free money. If your employer matches
          50% of the first 6% you contribute, and you put in 6%, they add 3%—an
          instant 50% return with no risk. Contribute at least enough to get the
          full match.
        </p>
        <p>
          <strong className="text-budgetu-heading">
            What happens when you leave:
          </strong>{" "}
          The money in your 401(k) is yours. When you leave, you can roll it into
          your new employer's 401(k) or into an IRA. Don't cash it out if you can
          avoid it—you'll pay taxes and often a penalty.
        </p>
      </div>
    ),
  },
  {
    id: "investing-stocks",
    title: "Investing in stocks (basics)",
    tagline:
      "Owning a piece of companies and growing your money over the long term",
    personalizationKey: "investing",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> When you
          invest in stocks, you're buying a small share of ownership in companies.
          Over many decades, the U.S. stock market has historically grown at a
          much higher rate than savings accounts or inflation—but it goes up and
          down along the way. Investing in stocks is best for money you won't
          need for a long time (typically at least 5–10 years).
        </p>
        <p>
          <strong className="text-budgetu-heading">
            Why students should think long-term:
          </strong>{" "}
          You have time on your side. Money you invest in your twenties has
          decades to grow and recover from market dips. Only invest what you can
          afford to leave alone.
        </p>
        <p>
          <strong className="text-budgetu-heading">
            Index funds—the simple approach:
          </strong>{" "}
          Instead of picking individual stocks, most experts suggest starting with
          index funds. An index fund tracks a whole segment of the market—like the
          S&P 500. You get diversification and low fees. For most people,
          especially beginners, a few low-cost index funds are enough.
        </p>
        <p>
          <strong className="text-budgetu-heading">What to avoid:</strong> Don't
          invest money you might need in the next few years. Don't put everything
          in one stock. Don't panic-sell when the market drops. And be wary of
          get-rich-quick schemes or trading based on social media.
        </p>
      </div>
    ),
  },
];

// ── Main component ─────────────────────────────────────────────────────────────

export default function EducationCards({
  personalization,
}: {
  personalization: EducationPersonalization | null;
}) {
  const router = useRouter();
  const [sheetCardId, setSheetCardId] = useState<CardId | null>(null);
  const [creatingGoal, setCreatingGoal] = useState(false);
  const [goalCreated, setGoalCreated] = useState<CardId | null>(null);

  const activeCard = cards.find((c) => c.id === sheetCardId);
  const activeTopic =
    activeCard?.personalizationKey && personalization
      ? (personalization[
          activeCard.personalizationKey
        ] as TopicPersonalization)
      : null;

  async function handleCreateGoal(
    goalData: NonNullable<TopicPersonalization["actionGoalData"]>,
    cardId: CardId
  ) {
    setCreatingGoal(true);
    const supabase = createClient();
    const result = await createSavingsGoal(supabase, {
      name: goalData.name,
      target_amount: goalData.target_amount,
      is_emergency_fund: goalData.is_emergency_fund,
    });
    setCreatingGoal(false);
    if (result.ok) {
      setGoalCreated(cardId);
      router.refresh();
    }
  }

  // Get the topic personalization for a card in list view
  function getCardTopic(
    personalizationKey: keyof EducationPersonalization | null
  ): TopicPersonalization | null {
    if (!personalizationKey || !personalization) return null;
    const val = personalization[personalizationKey];
    if (typeof val === "object" && val !== null && "status" in val)
      return val as TopicPersonalization;
    return null;
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => {
        const topic = getCardTopic(card.personalizationKey);
        return (
          <article
            key={card.id}
            className="border border-border rounded-xl overflow-hidden bg-budgetu-surface hover:border-budgetu-accent/30 transition-colors"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-budgetu-heading text-xl font-bold">
                      {card.title}
                    </h2>
                    {topic && <StatusBadge topic={topic} />}
                  </div>
                  <p className="text-budgetu-body text-sm">{card.tagline}</p>
                  {topic && (
                    <p className="text-budgetu-muted text-xs mt-2 line-clamp-2">
                      {topic.personalMessage}
                    </p>
                  )}
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="shrink-0 bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
                  onClick={() => setSheetCardId(card.id)}
                >
                  Start Quest
                </Button>
              </div>
            </div>
          </article>
        );
      })}

      <Sheet
        open={!!sheetCardId}
        onOpenChange={(open) => !open && setSheetCardId(null)}
      >
        <SheetContent
          side="right"
          className="flex flex-col bg-budgetu-surface border-border overflow-y-auto"
        >
          {activeCard && (
            <>
              <SheetHeader>
                <SheetTitle>{activeCard.title}</SheetTitle>
                <SheetDescription>{activeCard.tagline}</SheetDescription>
              </SheetHeader>

              {activeTopic && (
                <div className="mt-4 rounded-lg border border-border bg-budgetu-surface-alt p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge topic={activeTopic} />
                    <span className="text-xs text-budgetu-muted font-medium uppercase tracking-wide">
                      Your Situation
                    </span>
                  </div>
                  <p className="text-sm text-budgetu-body leading-relaxed">
                    {activeTopic.personalMessage}
                  </p>
                  {activeTopic.actionLabel && activeTopic.actionGoalData && (
                    <Button
                      size="sm"
                      className="bg-budgetu-accent hover:bg-budgetu-accent-hover text-white w-full"
                      disabled={
                        creatingGoal || goalCreated === activeCard.id
                      }
                      onClick={() =>
                        handleCreateGoal(
                          activeTopic.actionGoalData!,
                          activeCard.id
                        )
                      }
                    >
                      {goalCreated === activeCard.id
                        ? "Goal Created!"
                        : creatingGoal
                        ? "Creating..."
                        : activeTopic.actionLabel}
                    </Button>
                  )}
                </div>
              )}

              <div className="mt-4 flex-1 space-y-4">
                {activeTopic && (
                  <p className="text-xs text-budgetu-muted uppercase tracking-wide font-medium">
                    Full Guide
                  </p>
                )}
                {activeCard.content}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

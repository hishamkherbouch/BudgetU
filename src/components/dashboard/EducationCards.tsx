"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type CardId = string;

const cards: {
  id: CardId;
  title: string;
  tagline: string;
  content: React.ReactNode;
}[] = [
  {
    id: "emergency-fund",
    title: "Emergency fund",
    tagline: "Your safety net for when life throws a curveball",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> An
          emergency fund is money you set aside and don’t touch unless something
          unexpected happens—a car repair, a medical bill, losing your
          on-campus job, or your laptop dying right before finals. It’s not for
          concert tickets or a spring break trip; it’s there so you don’t have
          to put emergencies on a credit card or take out a high-interest loan.
        </p>
        <p>
          <strong className="text-budgetu-heading">Why it matters in college:</strong>{" "}
          Your income as a student is often irregular. One month you might have
          a refund or a paid internship; the next you’re scraping by. Even a
          small emergency fund ($500–$1,000) can cover a flat tire, a doctor
          visit, or a flight home in a family emergency without wrecking your
          budget or your credit.
        </p>
        <p>
          <strong className="text-budgetu-heading">How much to save:</strong>{" "}
          Start with a goal that feels doable—maybe $500. Then aim for one
          month of your essential expenses (rent if you pay it, food, utilities,
          phone, minimum debt payments). After graduation, many experts suggest
          building to 3–6 months of expenses. As a student, one month (or even
          a few hundred dollars) is a huge win.
        </p>
        <p>
          <strong className="text-budgetu-heading">Where to keep it:</strong>{" "}
          In a separate savings account—ideally a high-yield savings account
          (see that card!) so it earns a little interest. Keep it somewhere you
          can access within a day or two, but not so easy that you’re tempted
          to dip in for non-emergencies. Many people use a different bank than
          their main checking account for this reason.
        </p>
        <p>
          <strong className="text-budgetu-heading">How to build it:</strong>{" "}
          Automate it if you can: set up a small automatic transfer from
          checking to savings every payday or every month. Even $25 or $50 adds
          up. Put windfalls (tax refunds, birthday money, extra from a side
          gig) into the fund when you can. The key is consistency over time, not
          a huge lump sum right away.
        </p>
      </div>
    ),
  },
  {
    id: "high-yield-savings",
    title: "High-yield savings account (HYSA)",
    tagline: "Earn more on your savings with almost no extra effort",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> A
          high-yield savings account is a savings account that pays you a much
          higher interest rate than the typical big-bank savings account. At
          many traditional banks, savings accounts pay 0.01% or close to
          nothing. As of recent years, top HYSAs often pay 4–5% or more. Your
          money is still FDIC insured (up to the limit), so it’s very safe—you’re
          just choosing a bank that pays you more for holding your cash.
        </p>
        <p>
          <strong className="text-budgetu-heading">Why students should care:</strong>{" "}
          If you’re building an emergency fund or saving for study abroad, a
          move after graduation, or a car, keeping that money in an HYSA means
          it grows a little every month instead of sitting there earning
          nothing. The difference might seem small at first, but over a few
          years it adds up—and it takes almost no extra work once the account
          is open.
        </p>
        <p>
          <strong className="text-budgetu-heading">Where to find them:</strong>{" "}
          Online banks and credit unions usually offer the best rates because
          they have lower overhead than brick-and-mortar banks. You can search
          “best high-yield savings accounts” and compare current rates. Look
          for no monthly fees, no minimum balance (or a low one), and FDIC
          insurance. You don’t need to live near a branch—you manage everything
          online and can transfer money to and from your main checking account.
        </p>
        <p>
          <strong className="text-budgetu-heading">How to use one:</strong>{" "}
          Open an HYSA and link it to your main checking account. Transfer
          money in when you get paid or when you have extra; transfer out when
          you have a real emergency or hit a savings goal. There’s usually no
          penalty for withdrawals—you can access your money when you need it.
          Use it for your emergency fund and any short-term goals (under about
          five years). For money you might need in the next few months, it’s
          the best place to park it.
        </p>
      </div>
    ),
  },
  {
    id: "roth-ira",
    title: "Roth IRA",
    tagline: "Tax-free growth for retirement—especially powerful when you're young",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> A Roth
          IRA is an individual retirement account that you fund with money
          you’ve already paid taxes on. In return, the IRS lets your money
          grow tax-free inside the account, and when you take it out in
          retirement (under the rules), you don’t pay any tax on the gains.
          So you’re trading a little tax now for a lot of tax-free growth
          later.
        </p>
        <p>
          <strong className="text-budgetu-heading">Why it’s great for students:</strong>{" "}
          When you’re in college, you’re often in a low tax bracket—maybe
          working part-time or in a summer job. That means the “cost” of
          putting after-tax money into a Roth is relatively low. If you start
          even small (e.g. $50 or $100 a month), decades of tax-free growth can
          turn that into a significant amount by retirement. Starting at 20
          instead of 30 can mean a much bigger nest egg later.
        </p>
        <p>
          <strong className="text-budgetu-heading">Rules to know:</strong> You
          can only contribute if you have “earned income”—wages, salary, or
          self-employment income from a job or side gig. Investment income or
          allowance from parents doesn’t count. There’s an annual contribution
          limit set by the IRS (it changes each year). You can’t put in more
          than you earned that year. There are also income limits: if you earn
          above a certain amount, your allowed contribution may be reduced or
          phased out. As a student, you’re usually under those limits.
        </p>
        <p>
          <strong className="text-budgetu-heading">Flexibility:</strong> Unlike
          some retirement accounts, you can withdraw the money you contributed
          (not the investment gains) at any time, for any reason, without
          taxes or penalties. So in a true emergency, your contributions can
          double as a last-resort safety net. That doesn’t mean you should
          plan to raid it—the power is in leaving it to grow—but it’s a
          feature that can make starting one feel less scary.
        </p>
        <p>
          <strong className="text-budgetu-heading">How to get started:</strong>{" "}
          Open a Roth IRA at a low-cost broker or robo-advisor (many have no
          or low minimums). Choose simple investments like a target-date fund
          or a broad index fund. Set up automatic contributions from your
          checking account so you don’t have to think about it. Even small,
          consistent contributions in college can set you up for a much more
          comfortable retirement.
        </p>
      </div>
    ),
  },
  {
    id: "401k",
    title: "401(k)",
    tagline: "Employer retirement plans and why the match is free money",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> A
          401(k) is a retirement account that your employer offers. You choose
          to have a percentage or dollar amount taken from your paycheck and
          put into the account before (or sometimes after) taxes. That money
          is invested in funds you select (usually from a menu your employer
          provides). Many employers also offer a “match”—they’ll add extra
          money to your 401(k) if you contribute, up to a certain limit (e.g.
          “50% of the first 6% you contribute”).
        </p>
        <p>
          <strong className="text-budgetu-heading">Traditional vs. Roth 401(k):</strong>{" "}
          In a traditional 401(k), you contribute pre-tax money, which lowers
          your taxable income now; you’ll pay tax when you withdraw in
          retirement. In a Roth 401(k) (if your employer offers it), you
          contribute after-tax money, and qualified withdrawals in retirement
          are tax-free. For students in a low tax bracket, a Roth 401(k) can
          be especially attractive—you pay a little tax now and get tax-free
          growth later, similar to a Roth IRA.
        </p>
        <p>
          <strong className="text-budgetu-heading">Why the match matters:</strong>{" "}
          An employer match is essentially free money. If your employer matches
          50% of the first 6% you contribute, and you put in 6% of your
          paycheck, they add 3%—that’s an instant 50% return on that portion
          of your contribution. You rarely get that kind of return anywhere else
          with no risk. So if you have a job that offers a 401(k) with a
          match, contributing at least enough to get the full match is one of
          the best financial moves you can make.
        </p>
        <p>
          <strong className="text-budgetu-heading">When to prioritize it:</strong>{" "}
          If you’re stretched thin, order of operations usually goes: (1) build
          a small emergency fund so you’re not wiped out by one surprise
          expense, (2) pay down high-interest debt if you have it, (3) get the
          full 401(k) match if you have one. Once you have a basic safety net
          and no crushing debt, the 401(k) match should be high on your list.
          If you’re not sure how much to contribute, start with the minimum
          needed to get the full match—you can increase it later as your
          income grows.
        </p>
        <p>
          <strong className="text-budgetu-heading">What happens when you leave the job:</strong>{" "}
          The money in your 401(k) is yours. When you leave (graduation, new
          job, etc.), you can typically leave it where it is, roll it into your
          new employer’s 401(k), or roll it into an IRA. Don’t cash it out
          if you can avoid it—you’ll pay taxes and often a penalty, and you’ll
          lose years of growth. A rollover keeps the money working for your
          future.
        </p>
      </div>
    ),
  },
  {
    id: "investing-stocks",
    title: "Investing in stocks (basics)",
    tagline: "Owning a piece of companies and growing your money over the long term",
    content: (
      <div className="space-y-4 text-budgetu-body text-sm leading-relaxed">
        <p>
          <strong className="text-budgetu-heading">What it is:</strong> When
          you invest in stocks, you’re buying a small share of ownership in
          companies. If the company does well, the value of your shares can go
          up; if it does poorly, it can go down. Over many decades, the U.S.
          stock market has historically grown at a much higher rate than
          savings accounts or inflation—but it goes up and down along the way.
          So investing in stocks is best for money you won’t need for a long
          time (typically at least 5–10 years), like retirement or other
          long-term goals.
        </p>
        <p>
          <strong className="text-budgetu-heading">Why students should think long-term:</strong>{" "}
          You have time on your side. Money you invest in your twenties has
          decades to grow and recover from market dips. That doesn’t mean you
          should put tuition or rent money in the market—only invest what you
          can afford to leave alone. But if you have earned income and have
          already started an emergency fund and maybe a Roth IRA, learning
          about investing now can set you up for a much wealthier future.
        </p>
        <p>
          <strong className="text-budgetu-heading">Index funds—the simple approach:</strong>{" "}
          Instead of picking individual stocks (which is risky and time-consuming),
          most experts suggest starting with index funds. An index fund is a
          fund that tracks a whole segment of the market—like the S&P 500 (500
          large U.S. companies) or a total stock market index. You get
          diversification (your money is spread across many companies) and low
          fees. You’re betting on the economy’s long-term growth, not on one
          company. For most people, especially beginners, a few low-cost index
          funds (or a single target-date fund) are enough to build a solid
          portfolio.
        </p>
        <p>
          <strong className="text-budgetu-heading">Where to invest:</strong>{" "}
          You can invest inside retirement accounts (Roth IRA, 401(k)) or in a
          regular taxable brokerage account. Retirement accounts have tax
          advantages but rules about when you can withdraw. A taxable account
          is more flexible but you’ll pay tax on gains when you sell. Many
          brokers and robo-advisors offer low or no minimums and low fees—good
          for students who are starting with small amounts.
        </p>
        <p>
          <strong className="text-budgetu-heading">What to avoid:</strong> Don’t
          invest money you might need in the next few years (that belongs in
          savings). Don’t put everything in one stock or one sector. Don’t
          panic-sell when the market drops—history shows that staying invested
          through downturns has rewarded long-term investors. And be wary of
          get-rich-quick schemes, crypto hype, or trading based on social
          media. Slow, steady, diversified investing is boring but effective.
        </p>
      </div>
    ),
  },
];

export default function EducationCards() {
  const [expandedId, setExpandedId] = useState<CardId | null>(null);

  return (
    <div className="space-y-4">
      {cards.map((card) => {
        const isExpanded = expandedId === card.id;
        return (
          <article
            key={card.id}
            className="border border-border rounded-xl overflow-hidden bg-budgetu-surface hover:border-budgetu-accent/30 transition-colors"
          >
            <div
              className="p-6 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : card.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpandedId(isExpanded ? null : card.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-controls={`education-content-${card.id}`}
              id={`education-card-${card.id}`}
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-budgetu-heading text-xl font-bold">
                    {card.title}
                  </h2>
                  <p className="text-budgetu-body text-sm mt-1">{card.tagline}</p>
                </div>
                <Button
                  variant={isExpanded ? "secondary" : "default"}
                  size="sm"
                  className="shrink-0 bg-budgetu-accent hover:bg-budgetu-accent-hover text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : card.id);
                  }}
                >
                  {isExpanded ? "Show less" : "Learn more"}
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div
                id={`education-content-${card.id}`}
                role="region"
                aria-labelledby={`education-card-${card.id}`}
                className="border-t border-border bg-budgetu-surface-alt px-6 py-5"
              >
                {card.content}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

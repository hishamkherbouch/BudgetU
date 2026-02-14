const testimonials = [
  {
    quote:
      "BudgetU helped me save over $500 last semester. I finally understand where my money goes and can actually stick to my budget.",
    name: "Sarah Chen",
    affiliation: "Junior, UC Berkeley",
    initials: "SC",
  },
  {
    quote:
      "The roommate bill splitting is a game changer. No more awkward money conversations or forgotten Venmo requests.",
    name: "Marcus Johnson",
    affiliation: "Sophomore, NYU",
    initials: "MJ",
  },
  {
    quote:
      "I discovered I was spending $45/month on subscriptions I barely used. Canceled them and put that money toward my study abroad fund!",
    name: "Emma Rodriguez",
    affiliation: "Senior, UT Austin",
    initials: "ER",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-3" aria-hidden>
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="w-5 h-5 text-[#eab308] shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-6 pt-4 pb-2"
      aria-labelledby="testimonials-heading"
    >
      <h2
        id="testimonials-heading"
        className="text-center text-budgetu-heading text-2xl md:text-3xl font-bold mb-2"
      >
        Loved by students everywhere
      </h2>
      <p className="text-center text-budgetu-body text-base md:text-lg max-w-2xl mx-auto mb-10">
        Join thousands of college students taking control of their finances.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="bg-white rounded-xl border border-border shadow-sm p-6 flex flex-col"
          >
            <StarRating />
            <p className="text-budgetu-heading text-[0.9375rem] leading-relaxed flex-1 mb-5">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-budgetu-accent/15 text-budgetu-accent flex items-center justify-center text-sm font-semibold shrink-0"
                aria-hidden
              >
                {t.initials}
              </div>
              <div>
                <p className="font-bold text-budgetu-heading text-[0.9375rem]">
                  {t.name}
                </p>
                <p className="text-budgetu-muted text-sm">{t.affiliation}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

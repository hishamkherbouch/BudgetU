import Link from "next/link";

const productLinks = [
  { label: "Features", href: "/features" },
  { label: "FAQ", href: "/faq" },
  { label: "Mobile App", href: "#" },
  { label: "Security", href: "#" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Contact", href: "#" },
];

const legalLinks = [
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookie Policy", href: "#" },
];

const socialLinks = [
  { label: "Twitter", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-budgetu-bg text-white mt-auto">
      <div className="w-full max-w-7xl mx-auto px-6 py-12 md:px-10">
        {/* Top section: 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 no-underline mb-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-budgetu-accent text-white text-xl font-bold shrink-0">
                $
              </span>
              <span className="font-bold text-white text-lg">BudgetU</span>
            </Link>
            <p className="text-budgetu-muted text-sm leading-relaxed max-w-[200px]">
              Smart budgeting for college students
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-budgetu-muted text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-budgetu-muted text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-white text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-budgetu-muted text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-8" />

        {/* Bottom section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-budgetu-muted text-sm">
            © 2026 BudgetU. All rights reserved.
          </p>
          <div className="flex gap-6">
            {socialLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-budgetu-muted text-sm hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Floating help button */}
      <a
        href="#"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-budgetu-heading text-white flex items-center justify-center text-lg font-medium shadow-lg hover:bg-budgetu-accent transition-colors z-50"
        aria-label="Help"
      >
        ?
      </a>
    </footer>
  );
}

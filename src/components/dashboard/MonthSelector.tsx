"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthParam, formatMonthLabel } from "@/lib/month";

export default function MonthSelector({
  year,
  month,
}: {
  year: number;
  month: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pickerRef = useRef<HTMLInputElement>(null);

  function navigate(y: number, m: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", formatMonthParam(y, m));
    router.push(`${pathname}?${params.toString()}`);
  }

  function goPrev() {
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    navigate(y, m);
  }

  function goNext() {
    const m = month === 12 ? 1 : month + 1;
    const y = month === 12 ? year + 1 : year;
    navigate(y, m);
  }

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val && /^\d{4}-\d{2}$/.test(val)) {
      const [y, m] = val.split("-").map(Number);
      navigate(y, m);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goPrev}
        className="p-1.5 rounded-lg text-budgetu-muted hover:text-budgetu-heading hover:bg-budgetu-accent/10 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={() => pickerRef.current?.showPicker()}
        className="text-sm font-medium text-budgetu-heading hover:text-budgetu-accent transition-colors px-2 py-1 rounded-lg hover:bg-budgetu-accent/10 relative"
      >
        {formatMonthLabel(year, month)}
        <input
          ref={pickerRef}
          type="month"
          value={formatMonthParam(year, month)}
          onChange={handlePickerChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          tabIndex={-1}
        />
      </button>

      <button
        onClick={goNext}
        className="p-1.5 rounded-lg text-budgetu-muted hover:text-budgetu-heading hover:bg-budgetu-accent/10 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

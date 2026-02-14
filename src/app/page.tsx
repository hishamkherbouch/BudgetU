import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import DashboardPreview from "@/components/landing/DashboardPreview";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-budgetu-bg flex flex-col items-center px-6 pb-12">
      <main className="w-full max-w-[1100px] bg-white rounded-xl shadow-md overflow-hidden px-10 py-6">
        <Header />
        <Hero />
        <DashboardPreview />
      </main>
    </div>
  );
}

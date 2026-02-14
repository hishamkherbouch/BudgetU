import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full bg-budgetu-bg flex flex-col">
      <main className="w-full max-w-7xl mx-auto bg-white min-h-screen shadow-lg px-6 py-6 md:px-10 md:py-8 flex-1">
        <Header />
        <Hero />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

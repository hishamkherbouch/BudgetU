import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/dashboard/DashboardNav";
import Chatbot from "@/components/dashboard/Chatbot";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user?.user_metadata?.display_name ?? null;

  return (
    <div className="min-h-screen w-full bg-budgetu-bg">
      <div className="w-full max-w-7xl mx-auto min-h-screen px-4 py-6 sm:px-6 md:px-10 md:py-8">
        <DashboardNav displayName={displayName} />
        {children}
      </div>
      <Chatbot />
    </div>
  );
}

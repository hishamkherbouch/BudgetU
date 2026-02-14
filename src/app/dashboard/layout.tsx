import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/dashboard/DashboardNav";

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
    <div className="min-h-screen bg-budgetu-bg flex flex-col items-center px-6 py-8">
      <div className="w-full max-w-[1100px] bg-white rounded-xl shadow-md p-8">
        <DashboardNav displayName={displayName} />
        {children}
      </div>
    </div>
  );
}

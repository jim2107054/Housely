import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const user = await currentUser();
  const role = user?.publicMetadata?.role as string | undefined;

  if (role !== "ADMIN") {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}

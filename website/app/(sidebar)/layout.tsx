import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { auth } from "@/auth";

const SidebarLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth();
  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar session={session} />
      <main className="lg:pl-[280px]">{children}</main>
    </div>
  );
};

export default SidebarLayout;

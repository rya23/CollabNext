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
    <div className="min-h-screen flex">
      <Sidebar session={session} />
      <main className="flex-1 ml-[280px] bg-background">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;

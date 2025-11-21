"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push("/sign-in");
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        router.push("/sign-in");
        return;
      }

      setUser({
        firstName: userInfo.firstName,
        email: userInfo.email,
      });
      setLoading(false);
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-16 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar user={user} />
      <section className="flex flex-col size-full bg-gray-50">
        <div className="flex h-screen flex-col gap-6 overflow-y-scroll xl:overflow-y-hidden pb-20 md:pb-0">
          {children}
        </div>
        <MobileNav />
      </section>
    </main>
  );
}

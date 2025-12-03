"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import { useDemo } from "@/lib/demo/demoContext";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import LoadingBar from "@/components/LoadingBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDemoMode, demoUser } = useDemo();
  const [user, setUser] = useState<{ firstName: string; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      // Don't check auth on auth pages
      if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
        setLoading(false);
        return;
      }

      // If in demo mode, use demo user (even if not loaded yet, use placeholder)
      if (isDemoMode) {
        if (demoUser) {
          setUser({
            firstName: demoUser.firstName,
            email: demoUser.email,
          });
        } else {
          // Set a temporary demo user so sidebar renders
          setUser({
            firstName: "Demo",
            email: "demo@example.com",
          });
        }
        setLoading(false);
        return;
      }

      // Otherwise, check for real authentication
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        // Don't redirect - let the root page.tsx handle showing landing page
        setUser(null);
        setLoading(false);
        return;
      }

      const userInfo = await getUserInfo(currentUser.$id);
      if (!userInfo) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser({
        firstName: userInfo.firstName,
        email: userInfo.email,
      });
      setLoading(false);
    }

    checkAuth();
  }, [router, pathname, isDemoMode, demoUser]);

  if (loading) {
    return <LoadingBar />;
  }

  // In demo mode, always render sidebar (even if demoUser is still loading)
  if (isDemoMode) {
    // Use demoUser if available, otherwise use placeholder
    const displayUser = demoUser 
      ? { firstName: demoUser.firstName, email: demoUser.email }
      : { firstName: "Demo", email: "demo@example.com" };
    
    return (
      <main className="flex h-screen w-full font-inter">
        <Sidebar user={displayUser} isDemoMode={isDemoMode} />
        <section className="flex flex-col size-full bg-[#001122]">
          <div className="flex h-screen flex-col gap-6 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-container pb-20 md:pb-0">
            {children}
          </div>
          <MobileNav />
        </section>
      </main>
    );
  }

  // Only render sidebar if we have a user (authenticated)
  if (user) {
    return (
      <main className="flex h-screen w-full font-inter">
        <Sidebar user={user} isDemoMode={isDemoMode} />
        <section className="flex flex-col size-full bg-[#001122]">
          <div className="flex h-screen flex-col gap-6 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-container pb-20 md:pb-0">
            {children}
          </div>
          <MobileNav />
        </section>
      </main>
    );
  }

  // Otherwise, render children without sidebar (landing page)
  return <>{children}</>;
}

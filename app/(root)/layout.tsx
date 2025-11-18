"use client";

import { useEffect, useState, useRef } from "react";
import { getCurrentUser, getUserInfo } from "@/lib/appwrite/user";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Don't check auth if we're already on the sign-in page
    if (pathname === "/sign-in" || pathname === "/sign-up") {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      // Prevent multiple redirects
      if (hasRedirected.current) return;

      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          hasRedirected.current = true;
          router.replace("/sign-in");
          return;
        }

        const user = await getUserInfo(currentUser.$id);
        if (!user) {
          hasRedirected.current = true;
          router.replace("/sign-in");
          return;
        }

        setUserInfo(user);
      } catch (error) {
        console.error("Error checking auth:", error);
        if (!hasRedirected.current) {
          hasRedirected.current = true;
          router.replace("/sign-in");
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router, pathname]);

  // Don't show layout on auth pages
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return <>{children}</>;
  }

  if (loading || !userInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-16 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar
        user={{
          firstName: userInfo.firstName,
          email: userInfo.email,
        }}
      />
      <section className="flex flex-col size-full bg-gray-50">
        <div className="flex h-screen flex-col gap-6 overflow-y-scroll xl:overflow-y-hidden pb-20 md:pb-0">
          {children}
        </div>
        <MobileNav />
      </section>
    </main>
  );
}

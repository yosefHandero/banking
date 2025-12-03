"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { sidebarLinks } from "@/constants";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDemo } from "@/lib/demo/demoContext";

interface SidebarProps {
  user: {
    firstName: string;
    email: string;
  };
  isDemoMode?: boolean;
}

export default function Sidebar({ user, isDemoMode = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { exitDemoMode } = useDemo();

  const handleSignOut = async () => {
    // If in demo mode, exit demo mode instead
    if (isDemoMode) {
      exitDemoMode();
      toast.success("Exited demo mode");
      return;
    }

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to sign out");
      }

      toast.success("Signed out successfully");
      // Clear any cached data and redirect to landing page
      window.location.href = "/";
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <section className="sidebar">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
          <Image src="/icons/logo.png" width={34} height={34} alt="logo" />
          <h1 className="sidebar-logo">xyz</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route;
          return (
            <Link
              href={item.route}
              key={item.label}
              className={`sidebar-link ${isActive ? "bg-bank-gradient" : ""}`}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={20}
                height={20}
                className={isActive ? "brightness-[3] invert-0" : ""}
              />
              <p
                className={`${
                  isActive ? "text-white" : "text-gray-300"
                } sidebar-label`}
              >
                {item.label}
              </p>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-4 mt-auto">
        {isDemoMode && (
          <div className="px-4 py-2 bg-yellow-600/20 border border-yellow-600/50 rounded-lg mb-2">
            <p className="text-12 font-semibold text-yellow-400 text-center">
              DEMO MODE
            </p>
          </div>
        )}
        <div className="flex items-center gap-2 p-4 bg-gray-700 rounded-lg">
          <div className="flex size-8 items-center justify-center rounded-full bg-bankGradient text-white font-semibold">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="text-14 font-semibold text-white">
              {user.firstName}
            </p>
            <p className="text-12 text-gray-300">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="sidebar-link justify-start"
        >
          <Image src="/icons/logout.svg" alt="logout" width={20} height={20} />
          <p className="sidebar-label text-gray-300">
            {isDemoMode ? "Exit Demo" : "Sign Out"}
          </p>
        </Button>
      </div>
    </section>
  );
}

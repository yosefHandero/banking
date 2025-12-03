"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/appwrite/user";
import LoadingBar from "./LoadingBar";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      if (!requireAuth) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [requireAuth, router]);

  if (isLoading) {
    return <LoadingBar />;
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect to sign-in
  }

  return <>{children}</>;
}
 
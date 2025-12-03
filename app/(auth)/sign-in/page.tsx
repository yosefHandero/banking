"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/appwrite/user";

export default function SignIn() {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        router.push("/");
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full">
      <section className="auth-form">
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-white">
            Sign In
          </h1>
          <p className="text-16 font-normal text-gray-300">
            Sign in to your account to continue
          </p>
        </div>
        <AuthForm type="sign-in" />
      </section>
      <section className="auth-asset">
        {!imageError ? (
          <img
            src="/icons/image.png"
            alt="Auth image"
            width={500}
            height={500}
            className="hidden lg:block"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="hidden lg:flex items-center justify-center h-full w-full">
            <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">🏦</div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Welcome Back
                </h2>
                <p className="text-gray-300">Sign in to manage your finances</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

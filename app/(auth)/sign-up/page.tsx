"use client";

import { useEffect } from "react";
import AuthForm from "@/components/AuthForm";
import Image from "next/image";
import { getCurrentUser } from "@/lib/appwrite/user";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        // User is already signed in, redirect to home
        router.replace("/");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <div className="flex h-screen w-full">
      <section className="auth-form">
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            Sign Up
          </h1>
          <p className="text-16 font-normal text-gray-600">
            Create your account to get started
          </p>
        </div>
        <AuthForm type="sign-up" />
      </section>
      <section className="auth-asset">
        <Image
          src="/icons/auth-image.svg"
          alt="Auth image"
          width={500}
          height={500}
          className="hidden lg:block"
        />
      </section>
    </div>
  );
}

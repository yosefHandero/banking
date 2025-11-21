"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import Image from "next/image";
import { getCurrentUser } from "@/lib/appwrite/user";

export default function SignIn() {
  const router = useRouter();

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
        <div className="flex flex-col gap-1 md:gap-3"></div>
        <AuthForm type="sign-in" />
      </section>
      <section className="auth-asset">
        <Image
          src="/icons/image.png"
          alt="Auth image"
          width={500}
          height={500}
          className="hidden lg:block"
        />
      </section>
    </div>
  );
}

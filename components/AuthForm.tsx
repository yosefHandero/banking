"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Client, Account } from "appwrite";

const signUpSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  ssn: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type SignUpFormData = z.infer<typeof signUpSchema>;
type SignInFormData = z.infer<typeof signInSchema>;
type AuthFormData = SignUpFormData | SignInFormData;

interface AuthFormProps {
  type: "sign-in" | "sign-up";
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const schema = type === "sign-up" ? signUpSchema : signInSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (type === "sign-in") {
        // Use client-side authentication for sign-in to ensure cookies are set properly
        const client = new Client();
        client
          .setEndpoint(
            process.env.NEXT_PUBLIC_APPWRITE_URL ||
              "https://cloud.appwrite.io/v1"
          )
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

        const account = new Account(client);

        try {
          await account.createEmailPasswordSession({
            email: data.email,
            password: data.password,
          });
          toast.success("Signed in successfully!");
        } catch (sessionError: any) {
          // If session already exists, we're already authenticated - just redirect
          if (
            sessionError.message &&
            sessionError.message.includes("session is active")
          ) {
            // Verify we have a valid session
            try {
              await account.get();
              // Session is valid - silently redirect without showing message
            } catch (getError) {
              // Session exists but invalid - delete and recreate
              await account.deleteSession({ sessionId: "current" });
              await account.createEmailPasswordSession({
                email: data.email,
                password: data.password,
              });
              toast.success("Signed in successfully!");
            }
          } else {
            throw sessionError;
          }
        }

        // Small delay to ensure cookies are set before redirect
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Use router for navigation
        router.push("/");
        router.refresh();
      } else {
        // Sign-up: Use API route to create account and database document
        const response = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Authentication failed");
        }

        // After successful sign-up, create a session client-side
        const client = new Client();
        client
          .setEndpoint(
            process.env.NEXT_PUBLIC_APPWRITE_URL ||
              "https://cloud.appwrite.io/v1"
          )
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

        const account = new Account(client);

        try {
          await account.createEmailPasswordSession({
            email: data.email,
            password: data.password,
          });
          toast.success("Account created successfully!");
        } catch (sessionError: any) {
          // Handle 401 Unauthorized (likely email verification required)
          if (
            sessionError.code === 401 ||
            sessionError.message?.includes("Unauthorized")
          ) {
            toast.error(
              "Account created! Please check your email to verify your account before signing in."
            );
            // Redirect to sign-in page so user can sign in after verification
            router.push("/sign-in");
            return;
          }

          // If session already exists, we're already authenticated - just redirect
          if (
            sessionError.message &&
            sessionError.message.includes("session is active")
          ) {
            // Verify we have a valid session
            try {
              await account.get();
              // Session is valid - show success message and redirect
              toast.success("Account created successfully!");
            } catch (getError) {
              // Session exists but invalid - delete and recreate
              await account.deleteSession({ sessionId: "current" });
              await account.createEmailPasswordSession({
                email: data.email,
                password: data.password,
              });
              toast.success("Account created successfully!");
            }
          } else {
            throw sessionError;
          }
        }

        // Small delay to ensure cookies are set before redirect
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Use router for navigation
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      {type === "sign-up" && (
        <>
          <div className="form-item">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="input-class"
              {...register("firstName" as any)}
            />
            {(errors as any).firstName && (
              <p className="form-message">
                {(errors as any).firstName.message as string}
              </p>
            )}
          </div>
          <div className="form-item">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="input-class"
              {...register("lastName" as any)}
            />
            {(errors as any).lastName && (
              <p className="form-message">
                {(errors as any).lastName.message as string}
              </p>
            )}
          </div>
        </>
      )}

      <div className="form-item">
        <label className="form-label">Email</label>
        <input type="email" className="input-class" {...register("email")} />
        {errors.email && (
          <p className="form-message">{errors.email.message as string}</p>
        )}
      </div>

      <div className="form-item">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="input-class"
          {...register("password")}
        />
        {errors.password && (
          <p className="form-message">{errors.password.message as string}</p>
        )}
      </div>

      {type === "sign-up" && (
        <>
          <div className="form-item">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="input-class"
              {...register("address1" as any)}
            />
          </div>
          <div className="form-item">
            <label className="form-label">City</label>
            <input
              type="text"
              className="input-class"
              {...register("city" as any)}
            />
          </div>
          <div className="form-item">
            <label className="form-label">State</label>
            <input
              type="text"
              className="input-class"
              {...register("state" as any)}
            />
          </div>
          <div className="form-item">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              className="input-class"
              {...register("postalCode" as any)}
            />
          </div>
        </>
      )}

      <Button type="submit" className="form-btn w-full" disabled={isLoading}>
        {isLoading ? "Loading..." : type === "sign-up" ? "Sign Up" : "Sign In"}
      </Button>

      <p className="text-center text-14 text-gray-600">
        {type === "sign-up" ? (
          <>
            Already have an account?{" "}
            <a href="/sign-in" className="form-link">
              Sign In
            </a>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <a href="/sign-up" className="form-link">
              Sign Up
            </a>
          </>
        )}
      </p>
    </form>
  );
}

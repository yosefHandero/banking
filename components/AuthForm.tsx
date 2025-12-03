"use client";

import { useState } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signInAccount, createUserAccount } from "@/lib/appwrite/user";

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

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      if (type === "sign-in") {
        try {
          const response = await signInAccount(data.email, data.password);
          if (response) {
            toast.success("Signed in successfully!");
            router.push("/");
            router.refresh(); // Refresh to update auth state
          }
        } catch (signInError) {
          const errorMessage = signInError instanceof Error 
            ? signInError.message 
            : "Failed to sign in. Please check your credentials.";
          toast.error(errorMessage);
          return; // Don't proceed if sign-in fails
        }
      } else {
        // TypeScript type narrowing: we know it's SignUpFormData when type === "sign-up"
        const signUpData = data as SignUpFormData;
        const userData: SignUpFormData = {
          firstName: signUpData.firstName,
          lastName: signUpData.lastName,
          address1: signUpData.address1,
          city: signUpData.city,
          state: signUpData.state,
          postalCode: signUpData.postalCode,
          dateOfBirth: signUpData.dateOfBirth,
          ssn: signUpData.ssn,
          email: signUpData.email,
          password: signUpData.password,
        };

        try {
          const newUser = await createUserAccount(userData);
          if (newUser) {
            toast.success("Account created successfully!");
            router.push("/");
            router.refresh(); // Refresh to update auth state
          } else {
            toast.error("Failed to create account.");
          }
        } catch (signUpError) {
          const errorMessage = signUpError instanceof Error 
            ? signUpError.message 
            : "Failed to create account.";
          toast.error(errorMessage);
          return;
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Type-safe error access: cast to SignUpFormData errors when in sign-up mode
  const signUpErrors = type === "sign-up" ? (errors as FieldErrors<SignUpFormData>) : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      {type === "sign-up" && (
        <>
          <div className="form-item">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="input-class"
              {...register("firstName")}
            />
            {signUpErrors?.firstName && (
              <p className="form-message">
                {signUpErrors.firstName.message}
              </p>
            )}
          </div>
          <div className="form-item">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="input-class"
              {...register("lastName")}
            />
            {signUpErrors?.lastName && (
              <p className="form-message">
                {signUpErrors.lastName.message}
              </p>
            )}
          </div>
        </>
      )}

      <div className="form-item">
        <label className="form-label">Email</label>
        <input type="email" className="input-class" {...register("email")} />
        {errors.email && (
          <p className="form-message">{errors.email.message}</p>
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
          <p className="form-message">{errors.password.message}</p>
        )}
      </div>

      {type === "sign-up" && (
        <>
          <div className="form-item">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="input-class"
              {...register("address1")}
            />
          </div>
          <div className="form-item">
            <label className="form-label">City</label>
            <input
              type="text"
              className="input-class"
              {...register("city")}
            />
          </div>
          <div className="form-item">
            <label className="form-label">State</label>
            <input
              type="text"
              className="input-class"
              {...register("state")}
            />
          </div>
          <div className="form-item">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              className="input-class"
              {...register("postalCode")}
            />
          </div>
        </>
      )}

      <Button type="submit" className="form-btn w-full" disabled={isLoading}>
        {isLoading ? "Loading..." : type === "sign-up" ? "Sign Up" : "Sign In"}
      </Button>

      <p className="text-center text-14 text-gray-300">
        {type === "sign-up" ? (
          <>
            Already have an account?{" "}
            <a href="/sign-in" className="form-link">
              Sign In
            </a>
          </>
        ) : (
          <>
            Don&apos;t have an account?{" "}
            <a href="/sign-up" className="form-link">
              Sign Up
            </a>
          </>
        )}
      </p>
    </form>
  );
}

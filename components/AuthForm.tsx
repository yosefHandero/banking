'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  address1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  dateOfBirth: z.string().optional(),
  ssn: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const schema = type === 'sign-up' ? signUpSchema : signInSchema;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const endpoint = type === 'sign-up' ? '/api/auth/sign-up' : '/api/auth/sign-in';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Authentication failed');
      }

      toast.success(type === 'sign-up' ? 'Account created successfully!' : 'Signed in successfully!');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      {type === 'sign-up' && (
        <>
          <div className="form-item">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="input-class"
              {...register('firstName')}
            />
            {errors.firstName && (
              <p className="form-message">{errors.firstName.message as string}</p>
            )}
          </div>
          <div className="form-item">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="input-class"
              {...register('lastName')}
            />
            {errors.lastName && (
              <p className="form-message">{errors.lastName.message as string}</p>
            )}
          </div>
        </>
      )}

      <div className="form-item">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="input-class"
          {...register('email')}
        />
        {errors.email && (
          <p className="form-message">{errors.email.message as string}</p>
        )}
      </div>

      <div className="form-item">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="input-class"
          {...register('password')}
        />
        {errors.password && (
          <p className="form-message">{errors.password.message as string}</p>
        )}
      </div>

      {type === 'sign-up' && (
        <>
          <div className="form-item">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="input-class"
              {...register('address1')}
            />
          </div>
          <div className="form-item">
            <label className="form-label">City</label>
            <input
              type="text"
              className="input-class"
              {...register('city')}
            />
          </div>
          <div className="form-item">
            <label className="form-label">State</label>
            <input
              type="text"
              className="input-class"
              {...register('state')}
            />
          </div>
          <div className="form-item">
            <label className="form-label">Postal Code</label>
            <input
              type="text"
              className="input-class"
              {...register('postalCode')}
            />
          </div>
        </>
      )}

      <Button
        type="submit"
        className="form-btn w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : type === 'sign-up' ? 'Sign Up' : 'Sign In'}
      </Button>

      <p className="text-center text-14 text-gray-600">
        {type === 'sign-up' ? (
          <>
            Already have an account?{' '}
            <a href="/sign-in" className="form-link">
              Sign In
            </a>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <a href="/sign-up" className="form-link">
              Sign Up
            </a>
          </>
        )}
      </p>
    </form>
  );
}


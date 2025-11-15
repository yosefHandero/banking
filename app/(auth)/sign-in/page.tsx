import AuthForm from '@/components/AuthForm'
import Image from 'next/image'

export default function SignIn() {
  return (
    <div className="flex h-screen w-full">
      <section className="auth-form">
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            Sign In
          </h1>
          <p className="text-16 font-normal text-gray-600">
            Please enter your details
          </p>
        </div>
        <AuthForm type="sign-in" />
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
  )
}

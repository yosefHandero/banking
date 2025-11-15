'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { sidebarLinks } from '@/constants';
import { Button } from './ui/button';
import { signOutAccount } from '@/lib/appwrite/user';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SidebarProps {
  user: {
    firstName: string;
    email: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutAccount();
      toast.success('Signed out successfully');
      router.push('/sign-in');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return (
    <section className="sidebar">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer flex items-center gap-2">
          <Image src="/icons/logo.svg" width={34} height={34} alt="logo" />
          <h1 className="sidebar-logo">Banking</h1>
        </Link>

        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route;
          return (
            <Link
              href={item.route}
              key={item.label}
              className={`sidebar-link ${isActive ? 'bg-bank-gradient' : ''}`}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={20}
                height={20}
                className={isActive ? 'brightness-[3] invert-0' : ''}
              />
              <p className={`${isActive ? 'text-white' : 'text-gray-700'} sidebar-label`}>
                {item.label}
              </p>
            </Link>
          );
        })}

        <Link href="/ai-insights" className="sidebar-link">
          <Image src="/icons/monitor.svg" alt="AI Insights" width={20} height={20} />
          <p className="sidebar-label text-gray-700">AI Insights</p>
        </Link>
      </nav>

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex size-8 items-center justify-center rounded-full bg-bankGradient text-white font-semibold">
            {user.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <p className="text-14 font-semibold text-gray-900">{user.firstName}</p>
            <p className="text-12 text-gray-600">{user.email}</p>
          </div>
        </div>
        <Button onClick={handleSignOut} variant="ghost" className="sidebar-link justify-start">
          <Image src="/icons/logout.svg" alt="logout" width={20} height={20} />
          <p className="sidebar-label text-gray-700">Sign Out</p>
        </Button>
      </div>
    </section>
  );
}


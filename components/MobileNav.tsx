'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { sidebarLinks } from '@/constants';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <section className="fixed bottom-0 z-10 w-full rounded-t-[20px] bg-glassmorphism p-4 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between gap-2">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route;
          return (
            <Link
              href={item.route}
              key={item.label}
              className={`flex size-16 flex-col items-center justify-center rounded-lg gap-1 ${
                isActive && 'bg-bank-gradient'
              }`}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={20}
                height={20}
                className={isActive ? 'brightness-[3] invert-0' : ''}
              />
              <p className={`text-12 ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}


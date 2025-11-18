import { getCurrentUser, getUserInfo } from '@/lib/appwrite/user';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  const userInfo = await getUserInfo(currentUser.$id);
  if (!userInfo) {
    redirect('/sign-in');
  }

  return (
    <main className="flex h-screen w-full font-inter">
      <Sidebar
        user={{
          firstName: userInfo.firstName,
          email: userInfo.email,
        }}
      />
      <section className="flex flex-col size-full bg-gray-50">
        <div className="flex h-screen flex-col gap-6 overflow-y-scroll xl:overflow-y-hidden pb-20 md:pb-0">
          {children}
        </div>
        <MobileNav />
      </section>
    </main>
  );
}


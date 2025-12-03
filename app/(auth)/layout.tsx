export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full bg-[#001122] overflow-y-auto overflow-x-hidden custom-scrollbar scroll-container">
      {children}
    </main>
  );
}

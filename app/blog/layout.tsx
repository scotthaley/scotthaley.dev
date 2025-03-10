export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="p-4 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)] max-w-[1000px] w-full">
      <main className="flex flex-col items-center sm:items-start w-full">
        {children}
      </main>
    </div>
  );
}

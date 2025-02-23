import { ConvexClientProvider } from "@/components/ConvexClientProvider";

export default function DNDLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="pt-12 w-full">
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </div>
  );
}

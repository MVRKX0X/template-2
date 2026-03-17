export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060812]">
      <div className="mx-auto w-full max-w-md px-4">{children}</div>
    </div>
  );
}


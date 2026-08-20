export function EditSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-100 bg-[#f8f9fb] p-5">
      <h3 className="mb-4 font-['Inter',sans-serif] text-sm font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

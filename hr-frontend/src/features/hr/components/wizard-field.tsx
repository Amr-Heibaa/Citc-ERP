import { Label } from "@/components/ui/label";

export function WizardField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="font-['Inter',sans-serif] text-[15px] font-normal text-[#1f2c3e]">
        {label}
      </Label>

      {children}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

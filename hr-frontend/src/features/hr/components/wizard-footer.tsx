import { Button } from "@/components/ui/button";

export function WizardFooter({
  step,
  onBack,
  onSkip,
  pending,
  final = false,
}: {
  step: number;
  onBack?: () => void;
  onSkip?: () => void;
  pending?: boolean;
  final?: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between px-6 py-4">
      <p className="text-sm text-[#6b7280]">Step {step} of 5</p>

      <div className="flex gap-3">
        {onSkip && (
          <Button type="button" variant="outline" onClick={onSkip} className="w-24">
            Skip
          </Button>
        )}

        {onBack && (
          <Button type="button" variant="outline" onClick={onBack} className="w-24">
            Back
          </Button>
        )}

        <Button
          type="submit"
          disabled={pending}
          className="w-24 bg-[#1f2c3e] text-white"
        >
          {pending ? "Saving…" : final ? "Add" : "Next"}
        </Button>
      </div>
    </div>
  );
}

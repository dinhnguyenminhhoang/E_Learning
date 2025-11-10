import { CheckCircle2 } from "lucide-react";

function PasswordRequirement({
  met,
  children,
}: {
  met: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      ) : (
        <div className="h-4 w-4 rounded-full border border-slate-600" />
      )}
      <span className={met ? "text-emerald-400" : "text-slate-400"}>
        {children}
      </span>
    </div>
  );
}
export default PasswordRequirement;

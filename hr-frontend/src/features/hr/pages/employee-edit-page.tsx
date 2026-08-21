import { useNavigate, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEmployeeDetail } from "@/features/hr/api/use-employees";
import { EmployeeEditForm } from "@/features/hr/components/employee-edit-form";

export function EmployeeEditPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const id = Number(employeeId);

  const employee = useEmployeeDetail(id);

  function close() {
    navigate(`/hr/employees/${id}`);
  }

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="flex-col gap-0 overflow-hidden p-0"
        style={{
          display: "flex",
          width: "min(1000px, 95vw)",
          maxWidth: "none",
          height: "min(860px, 92vh)",
        }}
      >
        <DialogHeader className="shrink-0 border-b border-gray-100 px-6 py-5 text-left">
          <DialogTitle className="font-['Inter',sans-serif] text-2xl text-[#1a2535]">
            Edit Employee
          </DialogTitle>

          <DialogDescription>
            Update the employee personal and employment information.
          </DialogDescription>
        </DialogHeader>

        {employee.isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-gray-400">
            Loading employee…
          </div>
        ) : employee.isError || !employee.data ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <p className="text-sm text-red-600">Employee not found.</p>

            <Button variant="outline" onClick={() => navigate("/hr/employees")}>
              Back to employees
            </Button>
          </div>
        ) : (
          <EmployeeEditForm
            employee={employee.data}
            onSaved={close}
            onCancel={close}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  activateTemplate,
  createNewVersion,
  deactivateTemplate,
  uploadInitialFile,
  useGetTemplate,
  useListTemplates,
} from "@/lib/api/generated/ems/contract-template-controller/contract-template-controller";

const TEMPLATES_PREFIX = "/api/hr/contract-templates";

export function useContractTemplates(includeInactive = false) {
  return useListTemplates({ includeInactive });
}

export function useContractTemplateDetail(templateId: number) {
  return useGetTemplate(templateId, {
    query: { enabled: Number.isInteger(templateId) && templateId > 0 },
  });
}

function useInvalidateContractTemplates() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({
      predicate: (query) => {
        const [first] = query.queryKey;
        return typeof first === "string" && first.startsWith(TEMPLATES_PREFIX);
      },
    });
}

export function useUploadInitialTemplateFile(templateId: number) {
  const invalidate = useInvalidateContractTemplates();

  return useMutation({
    mutationFn: (file: File) => uploadInitialFile(templateId, { file }),
    onSuccess: invalidate,
  });
}

export function useCreateTemplateVersion(templateId: number) {
  const invalidate = useInvalidateContractTemplates();

  return useMutation({
    mutationFn: (file: File) => createNewVersion(templateId, { file }),
    onSuccess: invalidate,
  });
}

export function useActivateTemplate(templateId: number) {
  const invalidate = useInvalidateContractTemplates();

  return useMutation({
    mutationFn: () => activateTemplate(templateId),
    onSuccess: invalidate,
  });
}

export function useDeactivateTemplate(templateId: number) {
  const invalidate = useInvalidateContractTemplates();

  return useMutation({
    mutationFn: () => deactivateTemplate(templateId),
    onSuccess: invalidate,
  });
}

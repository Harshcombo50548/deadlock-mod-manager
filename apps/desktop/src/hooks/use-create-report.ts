import type { CreateReportInput } from "@deadlock-mods/shared";
import { invoke } from "@tauri-apps/api/core";
import { useMutation, useQueryClient } from "react-query";

interface CreateReportResponse {
  id: string;
  status: "success" | "error";
  error?: string;
}

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateReportInput,
    ): Promise<CreateReportResponse> => {
      return await invoke("create_report", { data });
    },
    onSuccess: (response, variables) => {
      if (response.status === "success") {
        // Invalidate report counts for the mod
        queryClient.invalidateQueries({
          queryKey: ["reportCounts", variables.modId],
        });

        // Invalidate recent reports
        queryClient.invalidateQueries({
          queryKey: ["recentReports"],
        });
      }
    },
  });
};

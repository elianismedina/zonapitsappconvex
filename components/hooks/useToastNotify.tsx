import { useCallback } from "react";

import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";

export type ToastNotifyOptions = {
  title: string;
  description?: string;
  action: "error" | "success";
  variant?: "solid" | "outline";
};

export const useToastNotify = () => {
  const toast = useToast();

  return useCallback(
    (opts: ToastNotifyOptions) => {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast
            nativeID={`toast-${id}`}
            action={opts.action}
            variant={opts.variant}
          >
            <ToastTitle>{opts.title}</ToastTitle>
            {opts.description ? (
              <ToastDescription>{opts.description}</ToastDescription>
            ) : null}
          </Toast>
        ),
      });
    },
    [toast],
  );
};

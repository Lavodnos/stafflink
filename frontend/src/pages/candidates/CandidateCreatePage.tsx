import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { CANDIDATE_CREATE_ENABLED } from "@/features/candidates";

export function CandidateCreatePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (CANDIDATE_CREATE_ENABLED) return;
    window.dispatchEvent(
      new CustomEvent("app:toast", {
        detail: {
          message: "La creación de candidatos está deshabilitada.",
          type: "info",
        },
      }),
    );
    navigate("/candidates", { replace: true });
  }, [navigate]);

  return null;
}

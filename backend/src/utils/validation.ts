import { ZodError } from "zod";
import { ApiError } from "./ApiError";

export function createValidationError(error: ZodError) {
  return new ApiError(
    400,
    "Validation error",
    true,
    error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }))
  );
}

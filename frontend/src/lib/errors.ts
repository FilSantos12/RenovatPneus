import { AxiosError } from 'axios'

export interface ValidationErrors {
  [field: string]: string[]
}

export function extractValidationErrors(error: unknown): ValidationErrors {
  if (error instanceof AxiosError && error.response?.data?.errors) {
    return error.response.data.errors
  }
  return {}
}

export function getFirstError(errors: ValidationErrors, field: string): string | undefined {
  return errors[field]?.[0]
}

export function getErrorMessage(error: unknown, fallback = 'Ocorreu um erro inesperado.'): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback
  }
  return fallback
}

// utils/errorHandlers.ts
import type { VpnInfo } from '../types';

export interface ExecutionResult {
  success: boolean;
  type?: string;
  error?: any;   // allow string | object
  data?: any;
}

function normalizeErrorMessage(error: any): string {
  if (!error) return "Something went wrong. Please try again later.";

  if (typeof error === "string") return error;

  // If backend sends { errors: [{ message: "..."}] }
  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.map((e: any) => e.message).join("\n");
  }

  // Catch-all
  return JSON.stringify(error);
}

export const handleExecutionError = (
  result: ExecutionResult
): { vpnInfo: VpnInfo; showVpn: boolean } => {
  console.log(result)
  const errorMessage = normalizeErrorMessage(result.error);
  
  if (result.type === "vpn_error") {
    return {
      vpnInfo: {
        title: "VPN Required",
        text: "To access this service, please connect to a VPN and try again.",
      },
      showVpn: true,
    };
  }

  if (result.type === "auth_error" || result.type === "invalid_credentials") {
    return {
      vpnInfo: {
        title: "Credential Error",
        text: "Your username or password is incorrect. Please check and try again.",
      },
      showVpn: true,
    };
  }

  if (result.type === "credentials_required") {
    return {
      vpnInfo: {
        title: "Credential Error",
        text: "Your username or password is required. Please check and try again.",
      },
      showVpn: true,
    };
  }

  if (result.type === "sql_error" || result.type === "superset_error") {
    return {
      vpnInfo: {
        title: "Superset Execution Error",
        text: errorMessage,
      },
      showVpn: true,
    };
  }

  // Default error
  return {
    vpnInfo: {
      title: "Unexpected Error",
      text: errorMessage,
    },
    showVpn: true,
  };
};

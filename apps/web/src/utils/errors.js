/**
 * Detects vault-limit errors raised by the Supabase trigger.
 * Backend error message contains 'vault_limit_reached' for free plan
 * users who hit the 20-title limit.
 */
export const isVaultLimitError = (err) =>
	Boolean(err?.message?.includes('vault_limit_reached'));

/**
 * Validates that a required environment variable is present.
 * Throws a descriptive error if the variable is missing.
 * 
 * @param name - The name of the environment variable
 * @param value - The value of the environment variable (from process.env)
 * @returns The validated value as a string
 * @throws Error if the variable is missing
 */
export function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n\n` +
      `Please create a .env.local file in the root directory with:\n` +
      `${name}=your_value_here\n\n` +
      `See ENV_SETUP.md for complete setup instructions.`
    );
  }
  return value;
}


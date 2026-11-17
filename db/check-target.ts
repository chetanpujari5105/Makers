import { describeTarget } from "./target";

// Run by `npm run db:migrate` before drizzle-kit, so the target is always shown.
try {
  describeTarget();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

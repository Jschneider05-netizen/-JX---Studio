import { createHash, timingSafeEqual } from "node:crypto";
import { tooManyRequests } from "@/lib/rate-limit";
/** No credential persistence; throttle guesses before comparing fixed-length hashes. */
export function authorized(request: Request): boolean {
  if (tooManyRequests(request, "admin", 120)) return false;
  const expected = process.env.JXSTUDIO_ADMIN_KEY;
  const supplied = request.headers.get("x-admin-key") || "";
  if (!expected || supplied.length > 512) return false;
  return timingSafeEqual(createHash("sha256").update(expected).digest(), createHash("sha256").update(supplied).digest());
}

/** Best-effort per-instance guard. Use a shared edge/WAF limit when scaling beyond one app instance. */
const windows = new Map<string, { count:number; resetsAt:number }>();
export function tooManyRequests(request:Request, bucket:string, limit:number, windowMs=600_000) {
  const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${bucket}:${ip.slice(0,80)}`;
  const now = Date.now();
  if (windows.size >= 5000) {
    for (const [name,entry] of windows) if (entry.resetsAt <= now) windows.delete(name);
    if (windows.size >= 5000) windows.delete(windows.keys().next().value!);
  }
  const entry = windows.get(key);
  if (!entry || entry.resetsAt <= now) { windows.set(key,{count:1,resetsAt:now+windowMs}); return false; }
  entry.count++;
  return entry.count > limit;
}
export const rateLimited = () => Response.json({error:"Zu viele Anfragen. Bitte versuche es später erneut."},{status:429,headers:{"retry-after":"600"}});

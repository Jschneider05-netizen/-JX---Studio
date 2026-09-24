import { compileCode } from "@/lib/jx-platform";
export async function POST(request:Request){try{const body=await request.json() as {configuration?:any};if(!body.configuration)return Response.json({error:"Konfiguration fehlt."},{status:400});return Response.json({files:compileCode(body.configuration)});}catch{return Response.json({error:"Compiler konnte nicht ausgeführt werden."},{status:500});}}

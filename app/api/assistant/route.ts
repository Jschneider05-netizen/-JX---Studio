import { rateLimited, tooManyRequests } from "@/lib/rate-limit";

type Message = {role:"assistant"|"user";text:string};
type Lead = {name?:string;email?:string;phone?:string;company?:string;location?:string;projectType?:string;goals?:string[];features?:string[];budget?:string;timeframe?:string;summary?:string;completeness?:number};
type Answer = {answer:string;offerHandoff:boolean;lead:Lead};
type ProviderOutput = {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};
const KNOWLEDGE = `Du bist der JX Assistant, digitaler Projektberater von JX Studio. Antworte auf Deutsch, professionell und knapp. Angebote: Websites, Shops, Web-Apps, Kundenportale, Software, Online-Marketing und KI-Assistenten. Standard-Websites beginnen derzeit bei 799 EUR. Nenne keine anderen festen Preise, Zusagen, Referenzen oder Termine ohne verifizierte Grundlage. Sammle Unternehmen, Standort, Projektart, Ziele, Funktionen, Budget, Zeitraum und Kontaktdaten. Bitte um fehlende Angaben und biete eine Projektanfrage an, sobald genügend Informationen vorliegen. Die Anfrage wird erst nach ausdrücklicher Bestätigung abgesendet. Antworte nur als JSON mit answer, offerHandoff und lead (name,email,phone,company,location,projectType,goals,features,budget,timeframe,summary,completeness).`;
const cut = (value:unknown,max=200) => typeof value === "string" ? value.trim().slice(0,max) : "";
function sanitizeLead(input:unknown):Lead {
  if (!input || typeof input !== "object") return {};
  const item=input as Record<string,unknown>;
  const list=(field:string)=>Array.isArray(item[field]) ? (item[field] as unknown[]).slice(0,8).map(x=>cut(x,100)).filter(Boolean) : [];
  return {name:cut(item.name,120),email:cut(item.email,200),phone:cut(item.phone,80),company:cut(item.company,160),location:cut(item.location,120),projectType:cut(item.projectType,100),goals:list("goals"),features:list("features"),budget:cut(item.budget,100),timeframe:cut(item.timeframe,100),summary:cut(item.summary,1000),completeness:Math.min(100,Math.max(0,Number(item.completeness)||0))};
}
function fallback(messages:Message[], old:Lead):Answer {
  const last=messages.at(-1)?.text || "", query=last.toLowerCase(), lead={...old};
  const email=last.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0];if(email)lead.email=email;
  const named=last.match(/(?:ich heiße|mein name ist|name\s*:)(?:\s+)([^\n,.!?]+)/i)?.[1]?.split(/\b(?:und|ich|meine|mein)\b/i)[0].trim();
  if(named) lead.name=cut(named.split(/\s+/).slice(0,3).join(" "),120);
  const company=last.match(/(?:meine firma heißt|mein unternehmen heißt|firma\s*:|unternehmen\s*:|wir heißen)\s*([^\n,.!?]+)/i)?.[1]?.split(/\b(?:und|ich|wir)\b/i)[0].trim();
  if(company)lead.company=cut(company,160);
  const location=last.match(/(?:standort\s*:|sitz in|aus)\s+([\p{L}-]{3,40})/iu)?.[1];
  if(location)lead.location=cut(location,120);
  if(/website|webseite|homepage/.test(query))lead.projectType="Website";
  if(/shop|e-commerce|onlineshop/.test(query))lead.projectType="Online-Shop";
  if(/software|web.?app|portal|dashboard/.test(query))lead.projectType="Software / Web-App";
  if(/chatbot|ki.assistent/.test(query))lead.projectType=lead.projectType||"KI-Assistent";
  const budget=last.match(/(?:budget|rahmen)\D{0,20}(\d[\d.,]*\s*(?:€|eur)?)/i)?.[1];if(budget)lead.budget=budget;
  const timeframe=last.match(/(?:bis|innerhalb von|in den nächsten)\s+([^.!?]{3,55})/i)?.[1];if(timeframe)lead.timeframe=timeframe.trim();
  const goal=last.match(/(?:ziel\s*:|ziel ist|ich möchte|wir möchten)\s+([^\n.!?]+)/i)?.[1];
  if(goal)lead.goals=[...new Set([...(lead.goals||[]),cut(goal,160)])].slice(0,8);
  const features=last.match(/funktionen?\s*:\s*([^\n.!?]+)/i)?.[1] || last.match(/(?:ich brauche|wir brauchen)\s+([^\n.!?]+)/i)?.[1];
  if(features)lead.features=[...new Set([...(lead.features||[]),...features.split(/,|\s+und\s+/i).map(item=>cut(item,100)).filter(Boolean)])].slice(0,8);
  const score=(lead.projectType?25:0)+(lead.budget?10:0)+(lead.company?15:0)+(lead.location?10:0)+(lead.timeframe?10:0)+(lead.email?10:0)+(lead.name?10:0)+((lead.features?.length||0)>0?10:0);
  lead.completeness=score;
  let answer="Erzähl mir kurz von deinem Unternehmen, deinem Standort und dem Ziel des Projekts. Danach können wir Funktionen, Budget und Zeitraum gemeinsam eingrenzen.";
  if(/preis|kosten|kostet/.test(query))answer="Eine Standard-Website beginnt derzeit bei 799 €. Der konkrete Umfang wird persönlich kalkuliert. Welche Seiten und Funktionen brauchst du?";
  else if(/chatbot|ki/.test(query))answer="Ein KI-Assistent kann Fragen beantworten und Projektanfragen vorbereiten. Was soll er für dein Unternehmen übernehmen? Preis und Umsetzung klären wir nach dem Umfang.";
  else if(/builder|konfigur/.test(query))answer="Wähle ein gestaltetes Template und passe Texte, Bilder, Farben und Seiten an. Deine Konfiguration kannst du anschließend als unverbindliche Anfrage übergeben.";
  else if(lead.projectType) {
    const missing=[!lead.company?"Name deines Unternehmens":null,!lead.location?"Standort":null,!lead.features?.length?"gewünschte Funktionen":null,!lead.budget?"Budgetrahmen":null,!lead.timeframe?"gewünschter Zeitraum":null].filter(Boolean);
    answer=missing.length?`Für ${lead.projectType} können wir einen passenden Umfang planen. Erzähl mir noch etwas über ${missing.slice(0,2).join(" und ")}.`:`Die Eckdaten für ${lead.projectType} sind erfasst. Wenn du möchtest, bereite ich daraus eine persönliche Projektanfrage vor.`;
  }
  return {answer,offerHandoff:score>=55,lead};
}

export async function POST(request:Request) {
  if(tooManyRequests(request,"assistant",50))return rateLimited();
  try {
    if(Number(request.headers.get("content-length")||0)>30_000)return Response.json({error:"Gespräch zu lang."},{status:413});
    const body=await request.json() as {messages?:unknown;lead?:unknown};
    const messages:Array<Message>=Array.isArray(body.messages)?body.messages.slice(-14).filter((m:unknown):m is Message=>Boolean(m&&typeof m==="object"&&["assistant","user"].includes((m as Message).role)&&typeof (m as Message).text==="string")).map((m:Message)=>({role:m.role,text:m.text.slice(0,1200)})):[];
    const lead=sanitizeLead(body.lead),key=process.env.OPENAI_API_KEY,model=process.env.OPENAI_MODEL;
    if(!key||!model)return Response.json(fallback(messages,lead));
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{Authorization:`Bearer ${key}`,"content-type":"application/json"},body:JSON.stringify({model,instructions:KNOWLEDGE,input:[{role:"user",content:`Bekannte Daten: ${JSON.stringify(lead)}\nGespräch:\n${messages.map(m=>`${m.role}: ${m.text}`).join("\n")}`}],max_output_tokens:900})});
    if(!response.ok){console.error("assistant_provider_error",response.status);return Response.json(fallback(messages,lead));}
    const data=await response.json() as ProviderOutput;
    const raw=data.output_text||data.output?.flatMap(part=>part.content||[]).find(part=>part.type==="output_text")?.text;
    if(!raw)return Response.json(fallback(messages,lead));
    const parsed=JSON.parse(raw) as Partial<Answer>;
    const answer=cut(parsed.answer,1600);
    const amounts=[...answer.matchAll(/\b(\d[\d.,]*)\s*(?:€|EUR)/gi)];
    if(!answer || amounts.some(match=>match[1]!=="799"))return Response.json(fallback(messages,lead));
    const merged={...lead,...Object.fromEntries(Object.entries(sanitizeLead(parsed.lead)).filter(([,value])=>Array.isArray(value)?value.length:Boolean(value)))} as Lead;
    return Response.json({answer,offerHandoff:Boolean(parsed.offerHandoff)&&Boolean(merged.projectType),lead:merged} satisfies Answer);
  } catch(error) {console.error("assistant_failed",error);return Response.json({answer:"Ich kann die Antwort gerade nicht zuverlässig erzeugen. Schreib mir gern noch einmal, was du planst.",offerHandoff:false,lead:{}} satisfies Answer);}
}

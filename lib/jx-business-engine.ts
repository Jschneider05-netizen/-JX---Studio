export type ModuleDefinition={id:string;entities:string[];rules:string[];admin:string[];integrations:string[]};
export const JX_MODULE_ENGINE:Record<string,ModuleDefinition>={
 "restaurant-reservations":{id:"restaurant-reservations",entities:["tables","reservations","opening_hours","blocked_times"],rules:["capacity","party-size","duration","buffer","no-double-booking"],admin:["calendar","tables","cancellations","no-shows"],integrations:["email","payments"]},
 appointments:{id:"appointments",entities:["services","staff","schedules","appointments","blocked_times"],rules:["duration","buffer","lead-time","staff-availability","no-double-booking"],admin:["calendar","staff","services","leave"],integrations:["email","payments"]},
 "fitness-booking":{id:"fitness-booking",entities:["classes","trainers","sessions","bookings"],rules:["capacity","waitlist","cutoff"],admin:["schedule","attendance","trainers"],integrations:["email"]},
 "real-estate":{id:"real-estate",entities:["properties","media","leads","viewings"],rules:["listing-status","viewing-availability"],admin:["properties","leads","viewings"],integrations:["maps","email"]},
 commerce:{id:"commerce",entities:["products","variants","inventory","carts","orders"],rules:["inventory","pricing","checkout"],admin:["catalog","orders","inventory"],integrations:["stripe","shopify"]},
 "hotel-booking":{id:"hotel-booking",entities:["rooms","rates","availability","stays"],rules:["occupancy","nightly-rate","date-overlap"],admin:["calendar","rooms","rates"],integrations:["payments","email"]},
 automotive:{id:"automotive",entities:["vehicles","services","appointments"],rules:["service-duration","bay-availability"],admin:["vehicles","calendar","services"],integrations:["email"]},
 "service-configurator":{id:"service-configurator",entities:["services","requests","uploads"],rules:["service-area","budget","preferred-date"],admin:["requests","services"],integrations:["email","storage"]},
 vouchers:{id:"vouchers",entities:["voucher_products","voucher_codes","redemptions"],rules:["validity","value","redemption-status"],admin:["vouchers","redemptions"],integrations:["payments","email"]},
 newsletter:{id:"newsletter",entities:["subscribers","lists","consents"],rules:["double-opt-in","unsubscribe"],admin:["subscribers","lists"],integrations:["email-provider"]}
};
export function modulePlan(ids:string[]=[]){return ids.map(id=>JX_MODULE_ENGINE[id]).filter(Boolean)}

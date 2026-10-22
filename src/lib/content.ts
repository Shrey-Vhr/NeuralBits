export type ContentStatus = "draft" | "pending_review" | "approved" | "archived";

export type Material = {
  slug: string;
  name: string;
  category: string;
  description: string;
  householdExamples: string[];
  segregationGuidance: string;
  specialHandling?: string;
  safetyPrecautions: string[];
  isPublished: boolean;
};

export type Item = {
  slug: string;
  name: string;
  alternativeNames: string[];
  description: string;
  materialSlugs: string[];
  isHazardous: boolean;
  handlingNote?: string;
  isPublished: boolean;
};

export type PreparationGuide = {
  slug: string;
  itemSlug: string;
  materialSlug: string;
  title: string;
  description: string;
  preparationSteps: string[];
  safetyWarnings: string[];
  doNotDo: string[];
  recommendedRoute: string;
  approvalStatus: ContentStatus;
  lastReviewedDate: string | null;
  reviewerNotes: string;
};

export const materials: Material[] = [
  { slug: "paper", name: "Paper", category: "Paper", description: "Fibrous material commonly used for writing, printing, and packaging.", householdExamples: ["Newspaper", "Office paper", "Magazines"], segregationGuidance: "Keep dry and separate from food-soiled or laminated material where possible.", specialHandling: "Wet, mouldy, or heavily contaminated paper may need a different disposal route.", safetyPrecautions: ["Keep away from fire and moisture."], isPublished: true },
  { slug: "cardboard", name: "Cardboard", category: "Cardboard", description: "Layered paperboard used for boxes and protective packaging.", householdExamples: ["Shipping boxes", "Cereal boxes", "Paperboard cartons"], segregationGuidance: "Flatten clean, dry cardboard and remove obvious plastic or foam inserts.", specialHandling: "Waxed, laminated, or food-soiled board may not be accepted by every collector.", safetyPrecautions: ["Use care around staples and sharp packing edges."], isPublished: true },
  { slug: "plastic", name: "Plastic", category: "Plastic", description: "A broad family of synthetic materials with different grades and uses.", householdExamples: ["Bottles", "Buckets", "Chairs"], segregationGuidance: "Keep different plastic types separate when local collection guidance asks for it; empty and rinse containers when practical.", specialHandling: "Acceptance depends on polymer, condition, and local buyer requirements.", safetyPrecautions: ["Do not burn plastic or use unknown containers for food or water."], isPublished: true },
  { slug: "iron-steel", name: "Iron and steel", category: "Metal", description: "Ferrous metals used in tools, containers, frames, and appliances.", householdExamples: ["Utensils", "Cans", "Bicycle frames"], segregationGuidance: "Keep dry and separate from loose non-metal parts where practical.", specialHandling: "Sharp, rusted, or appliance parts may need careful handling.", safetyPrecautions: ["Wear gloves around sharp edges and do not dismantle powered appliances."], isPublished: true },
  { slug: "aluminium", name: "Aluminium", category: "Metal", description: "A lightweight non-ferrous metal used in cans, foil, frames, and household goods.", householdExamples: ["Drink cans", "Foil", "Cookware"], segregationGuidance: "Empty and flatten cans only if safe; keep foil reasonably clean.", specialHandling: "Foil mixed with food or composite layers may not be accepted.", safetyPrecautions: ["Watch for sharp can edges."], isPublished: true },
  { slug: "copper", name: "Copper", category: "Metal", description: "A conductive non-ferrous metal found in wire, tubing, and some fixtures.", householdExamples: ["Electrical wire", "Pipes", "Motor windings"], segregationGuidance: "Keep intact items separate and do not strip or dismantle electrical equipment for scrap.", specialHandling: "Electrical and building components may require a trained professional.", safetyPrecautions: ["Treat connected wire and equipment as electrically live until isolated by a professional."], isPublished: true },
  { slug: "glass", name: "Glass", category: "Glass", description: "Rigid transparent or coloured material used in bottles, jars, and household products.", householdExamples: ["Glass bottles", "Jars", "Containers"], segregationGuidance: "Empty containers and keep glass separate from other materials.", specialHandling: "Broken glass should follow local sharp-waste or collection guidance.", safetyPrecautions: ["Do not place loose broken glass in a thin bag; use a rigid, clearly marked container."], isPublished: true },
  { slug: "electronic-waste", name: "Electronic waste", category: "Electronic waste", description: "Discarded electrical and electronic equipment containing mixed materials and components.", householdExamples: ["Phones", "Keyboards", "Fans", "Laptops"], segregationGuidance: "Keep electronics dry and take them to an authorised e-waste channel when available.", specialHandling: "Batteries, screens, refrigerants, and circuit boards need specialist handling.", safetyPrecautions: ["Do not open, crush, burn, or place electronics in household recycling."], isPublished: true },
  { slug: "textiles", name: "Textiles", category: "Textiles", description: "Fabric and fibre-based goods such as clothing, linen, and bags.", householdExamples: ["Clothing", "Curtains", "Bags"], segregationGuidance: "Keep clean and dry; separate reusable items from damaged fabric.", specialHandling: "Contaminated or wet textiles may need a different route.", safetyPrecautions: ["Do not handle visibly contaminated material without appropriate protection."], isPublished: true },
  { slug: "mixed-materials", name: "Mixed materials", category: "Mixed materials", description: "Items made from multiple bonded or attached materials that are difficult to separate.", householdExamples: ["Laminated packaging", "Composite furniture", "Multi-part products"], segregationGuidance: "Do not force separation; ask the receiving collector what they accept.", specialHandling: "Complex products may need a specialist or manufacturer take-back route.", safetyPrecautions: ["Avoid cutting, heating, or dismantling unknown composite items."], isPublished: true },
];

export const items: Item[] = [
  { slug: "cardboard-box", name: "Cardboard box", alternativeNames: ["Carton", "Packing box"], description: "A paperboard box used for shipping, storage, or household packaging.", materialSlugs: ["cardboard"], isHazardous: false, isPublished: true },
  { slug: "newspaper", name: "Newspaper", alternativeNames: ["Newsprint", "Daily paper"], description: "Printed paper sheets commonly collected as dry paper scrap.", materialSlugs: ["paper"], isHazardous: false, isPublished: true },
  { slug: "plastic-bottle", name: "Plastic bottle", alternativeNames: ["PET bottle", "Water bottle"], description: "A plastic bottle used for drinks, household products, or personal care.", materialSlugs: ["plastic"], isHazardous: false, isPublished: true },
  { slug: "aluminium-can", name: "Aluminium can", alternativeNames: ["Soft drink can", "Tin can"], description: "A lightweight metal beverage or food can.", materialSlugs: ["aluminium"], isHazardous: false, isPublished: true },
  { slug: "steel-utensil", name: "Steel utensil", alternativeNames: ["Stainless steel spoon", "Metal utensil"], description: "A household utensil made primarily from steel or stainless steel.", materialSlugs: ["iron-steel"], isHazardous: false, isPublished: true },
  { slug: "copper-wire", name: "Copper wire", alternativeNames: ["Electrical wire", "Copper cable"], description: "Conductive wire that may be part of a cable or electrical component.", materialSlugs: ["copper"], isHazardous: true, handlingNote: "Do not handle connected or damaged wiring. Use a qualified electrician or authorised e-waste collector.", isPublished: true },
  { slug: "glass-bottle", name: "Glass bottle", alternativeNames: ["Glass jar", "Bottle"], description: "A rigid glass container used for drinks, food, or household products.", materialSlugs: ["glass"], isHazardous: false, isPublished: true },
  { slug: "plastic-chair", name: "Plastic chair", alternativeNames: ["Plastic stool", "Plastic furniture"], description: "A rigid plastic household chair or stool, sometimes with metal parts.", materialSlugs: ["plastic", "iron-steel"], isHazardous: false, isPublished: true },
  { slug: "old-books", name: "Old books", alternativeNames: ["Books", "Textbooks"], description: "Bound paper items that may be reusable, donated, or recycled when damaged.", materialSlugs: ["paper", "mixed-materials"], isHazardous: false, isPublished: true },
  { slug: "metal-container", name: "Metal container", alternativeNames: ["Tin container", "Steel box"], description: "A metal storage or food container made from steel or another metal.", materialSlugs: ["iron-steel"], isHazardous: false, isPublished: true },
  { slug: "plastic-bucket", name: "Plastic bucket", alternativeNames: ["Tub", "Plastic pail"], description: "A rigid reusable plastic household container.", materialSlugs: ["plastic"], isHazardous: false, isPublished: true },
  { slug: "old-clothing", name: "Old clothing", alternativeNames: ["Clothes", "Garments"], description: "Fabric garments that may be reusable, repairable, or unsuitable for further wear.", materialSlugs: ["textiles"], isHazardous: false, isPublished: true },
  { slug: "bicycle", name: "Bicycle", alternativeNames: ["Cycle", "Bike"], description: "A metal-framed vehicle with rubber, plastic, and other attached parts.", materialSlugs: ["iron-steel", "rubber", "mixed-materials"].filter((slug) => slug !== "rubber"), isHazardous: false, isPublished: true },
  { slug: "broken-fan", name: "Broken fan", alternativeNames: ["Electric fan", "Table fan"], description: "A powered appliance containing metal, plastic, wiring, and a motor.", materialSlugs: ["electronic-waste", "plastic", "iron-steel"], isHazardous: true, handlingNote: "Keep unplugged and dry. Use an authorised e-waste collection route; do not open the motor or wiring.", isPublished: true },
  { slug: "computer-keyboard", name: "Computer keyboard", alternativeNames: ["Keyboard", "USB keyboard"], description: "An electronic input device made from plastic, circuits, and wiring.", materialSlugs: ["electronic-waste", "plastic"], isHazardous: true, handlingNote: "Keep dry and intact. Use an authorised e-waste collection route rather than household recycling.", isPublished: true },
  { slug: "mobile-phone", name: "Mobile phone", alternativeNames: ["Cell phone", "Smartphone"], description: "A small electronic device containing a screen, circuit board, and rechargeable battery.", materialSlugs: ["electronic-waste", "mixed-materials"], isHazardous: true, handlingNote: "Do not puncture, crush, heat, or open the phone. Use an authorised e-waste or manufacturer take-back route.", isPublished: true },
  { slug: "laptop", name: "Laptop", alternativeNames: ["Notebook computer", "Portable computer"], description: "A portable computer containing electronics, a screen, and a rechargeable battery.", materialSlugs: ["electronic-waste", "mixed-materials"], isHazardous: true, handlingNote: "Do not dismantle or remove the battery yourself. Use an authorised e-waste channel.", isPublished: true },
  { slug: "television", name: "Television", alternativeNames: ["TV", "LED TV"], description: "An electronic display appliance with circuits, plastics, and a screen.", materialSlugs: ["electronic-waste", "mixed-materials"], isHazardous: true, handlingNote: "Keep intact and dry. Do not break the screen or open the casing; use authorised e-waste handling.", isPublished: true },
  { slug: "refrigerator", name: "Refrigerator", alternativeNames: ["Fridge", "Freezer"], description: "A large appliance containing electrical parts, insulation, refrigerant, and metal.", materialSlugs: ["electronic-waste", "iron-steel", "mixed-materials"], isHazardous: true, handlingNote: "Do not cut pipes, remove refrigerant, or dismantle the appliance. Arrange specialist appliance handling.", isPublished: true },
  { slug: "lithium-ion-battery", name: "Lithium-ion battery", alternativeNames: ["Rechargeable battery", "Power bank battery"], description: "A rechargeable battery used in phones, laptops, tools, and power banks.", materialSlugs: ["electronic-waste", "mixed-materials"], isHazardous: true, handlingNote: "Keep away from heat and metal objects. If swollen, hot, leaking, or damaged, isolate it safely and contact a hazardous-waste or authorised e-waste service.", isPublished: true },
];

const hazardousRoutes: Record<string, { steps: string[]; warnings: string[]; doNotDo: string[]; route: string }> = {
  "copper-wire": { steps: ["Stop using the item if wiring is damaged or exposed.", "Do not cut, strip, or handle connected wire.", "Contact a qualified electrician or authorised e-waste collector."], warnings: ["Electrical wiring may remain live even when an appliance appears switched off."], doNotDo: ["Do not burn insulation or dismantle electrical equipment."], route: "Qualified electrician or authorised e-waste channel." },
  "broken-fan": { steps: ["Unplug the fan and keep it dry.", "Keep the appliance intact and separate from ordinary household waste.", "Arrange collection through an authorised e-waste channel."], warnings: ["The motor, wiring, and sharp internal parts require careful handling."], doNotDo: ["Do not open the motor housing or attempt repairs while disposing of it."], route: "Authorised e-waste collection." },
  "computer-keyboard": { steps: ["Remove loose dust without opening the casing.", "Keep the keyboard dry and intact.", "Take it to an authorised e-waste collection point."], warnings: ["Electronic components should not enter ordinary mixed recycling."], doNotDo: ["Do not burn, crush, or dismantle the keyboard."], route: "Authorised e-waste collection." },
  "mobile-phone": { steps: ["Back up and erase personal data if the device still works.", "Keep the phone intact and dry.", "Use an authorised e-waste or manufacturer take-back route."], warnings: ["The rechargeable battery can ignite if punctured, crushed, or overheated."], doNotDo: ["Do not open, puncture, crush, heat, or place in a general scrap bag."], route: "Authorised e-waste or manufacturer take-back." },
  "laptop": { steps: ["Back up and erase personal data if possible.", "Keep the laptop closed, dry, and intact.", "Use an authorised e-waste collection route."], warnings: ["The internal rechargeable battery requires specialist handling."], doNotDo: ["Do not remove the battery or dismantle the laptop yourself."], route: "Authorised e-waste collection." },
  "television": { steps: ["Unplug the television and keep it upright if safe to do so.", "Protect the screen from impact.", "Arrange authorised e-waste collection."], warnings: ["Broken screens and internal components may create sharp or hazardous fragments."], doNotDo: ["Do not break the screen, burn the casing, or open the television."], route: "Authorised e-waste collection." },
  "refrigerator": { steps: ["Keep the refrigerator unplugged and upright.", "Do not cut or puncture any pipes or coils.", "Arrange specialist appliance collection."], warnings: ["Refrigerant and compressor components require trained handling."], doNotDo: ["Do not remove refrigerant or dismantle the appliance."], route: "Specialist appliance or authorised e-waste service." },
  "lithium-ion-battery": { steps: ["Stop using the battery if it is swollen, hot, leaking, or damaged.", "Keep it away from heat, water, and loose metal objects.", "Contact an authorised e-waste or hazardous-waste service for instructions."], warnings: ["A damaged lithium-ion battery can ignite or release harmful material."], doNotDo: ["Do not puncture, crush, charge, tape over damage, burn, or place it in household recycling."], route: "Authorised e-waste or hazardous-waste service." },
};

function makeGuide(item: Item): PreparationGuide {
  const special = hazardousRoutes[item.slug];
  if (special) return { slug: `${item.slug}-guide`, itemSlug: item.slug, materialSlug: item.materialSlugs[0], title: `How to handle ${item.name}`, description: `Conservative handling guidance for ${item.name}. This content is a draft demonstration until reviewed and approved by the ScrapReady content owner.`, preparationSteps: special.steps, safetyWarnings: special.warnings, doNotDo: special.doNotDo, recommendedRoute: special.route, approvalStatus: "pending_review", lastReviewedDate: null, reviewerNotes: "Pending review by a qualified content reviewer.", };
  return { slug: `${item.slug}-guide`, itemSlug: item.slug, materialSlug: item.materialSlugs[0], title: `How to prepare ${item.name}`, description: `Basic preparation guidance for ${item.name}. Acceptance varies by local collector and material condition. This content is a draft demonstration until reviewed and approved by the ScrapReady content owner.`, preparationSteps: ["Check the item is empty, reasonably clean, and dry where practical.", "Separate obvious attachments or different materials only when this can be done safely without tools.", "Keep the prepared item dry and separate from food waste.", "Ask the receiving collector what they accept before arranging collection."], safetyWarnings: ["Stop if the item is sharp, contaminated, pressurised, electrically connected, or otherwise uncertain."], doNotDo: ["Do not burn, cut, heat, crush, or dismantle the item just to prepare it for scrap."], recommendedRoute: "Use the relevant local collection or authorised recycling route after confirming acceptance.", approvalStatus: "pending_review", lastReviewedDate: null, reviewerNotes: "Pending review by a qualified content reviewer.", };
}

export const preparationGuides: PreparationGuide[] = items.map(makeGuide);

export function getMaterial(slug: string) { return materials.find((material) => material.slug === slug); }
export function getItem(slug: string) { return items.find((item) => item.slug === slug); }
export function getGuide(slug: string) { return preparationGuides.find((guide) => guide.slug === slug); }

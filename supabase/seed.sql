-- Optional seed template for reviewed content. Run only after reviewing each row.
-- Keep preparation guides as pending_review until a qualified reviewer approves them.

insert into public.materials (slug, name, category, description, household_examples, segregation_guidance, special_handling, safety_precautions, is_published)
values
('paper', 'Paper', 'Paper', 'Fibrous material commonly used for writing, printing, and packaging.', array['Newspaper', 'Office paper', 'Magazines'], 'Keep dry and separate from food-soiled or laminated material where possible.', 'Wet, mouldy, or heavily contaminated paper may need a different disposal route.', array['Keep away from fire and moisture.'], true),
('cardboard', 'Cardboard', 'Cardboard', 'Layered paperboard used for boxes and protective packaging.', array['Shipping boxes', 'Cereal boxes', 'Paperboard cartons'], 'Flatten clean, dry cardboard and remove obvious plastic or foam inserts.', 'Waxed, laminated, or food-soiled board may not be accepted by every collector.', array['Use care around staples and sharp packing edges.'], true),
('plastic', 'Plastic', 'Plastic', 'A broad family of synthetic materials with different grades and uses.', array['Bottles', 'Buckets', 'Chairs'], 'Keep different plastic types separate when local collection guidance asks for it; empty and rinse containers when practical.', 'Acceptance depends on polymer, condition, and local buyer requirements.', array['Do not burn plastic or use unknown containers for food or water.'], true),
('iron-steel', 'Iron and steel', 'Metal', 'Ferrous metals that are attracted to magnets and used in tools, containers, and appliances.', array['Utensils', 'Cans', 'Bicycle frames'], 'Keep dry and separate from loose non-metal parts where practical.', 'Sharp, rusted, or appliance parts may need careful handling.', array['Wear gloves around sharp edges and do not dismantle powered appliances.'], true),
('aluminium', 'Aluminium', 'Metal', 'A lightweight non-ferrous metal used in cans, foil, frames, and household goods.', array['Drink cans', 'Foil', 'Cookware'], 'Empty and flatten cans only if safe; keep foil reasonably clean.', 'Foil mixed with food or composite layers may not be accepted.', array['Watch for sharp can edges.'], true),
('copper', 'Copper', 'Metal', 'A conductive non-ferrous metal found in wire, tubing, and some fixtures.', array['Electrical wire', 'Pipes', 'Motor windings'], 'Keep intact items separate and do not strip or dismantle electrical equipment for scrap.', 'Electrical and building components may require a trained professional.', array['Treat connected wire and equipment as electrically live until isolated by a professional.'], true),
('glass', 'Glass', 'Glass', 'Rigid transparent or coloured material used in bottles, jars, and some household products.', array['Glass bottles', 'Jars', 'Containers'], 'Empty containers and keep glass separate from other materials.', 'Broken glass should follow the local sharp-waste or collection guidance.', array['Do not place loose broken glass in a thin bag; use a rigid, clearly marked container.'], true),
('electronic-waste', 'Electronic waste', 'Electronic waste', 'Discarded electrical and electronic equipment containing mixed materials and components.', array['Phones', 'Keyboards', 'Fans', 'Laptops'], 'Keep electronics dry and take them to an authorised e-waste channel when available.', 'Batteries, screens, refrigerants, and circuit boards need specialist handling.', array['Do not open, crush, burn, or place electronics in household recycling.'], true),
('textiles', 'Textiles', 'Textiles', 'Fabric and fibre-based goods such as clothing, linen, and bags.', array['Clothing', 'Curtains', 'Bags'], 'Keep clean and dry; separate reusable items from damaged fabric.', 'Contaminated or wet textiles may need a different route.', array['Do not handle visibly contaminated material without appropriate protection.'], true),
('mixed-materials', 'Mixed materials', 'Mixed materials', 'Items made from multiple bonded or attached materials that are difficult to separate.', array['Laminated packaging', 'Composite furniture', 'Multi-part products'], 'Do not force separation; ask the receiving collector what they accept.', 'Complex products may need a specialist or manufacturer take-back route.', array['Avoid cutting, heating, or dismantling unknown composite items.'], true)
on conflict (slug) do nothing;

insert into public.items (slug, name, alternative_names, description, is_hazardous, handling_note, is_published)
values
('cardboard-box', 'Cardboard box', array['Carton', 'Packing box'], 'A paperboard box used for shipping, storage, or household packaging.', false, null, true),
('newspaper', 'Newspaper', array['Newsprint', 'Daily paper'], 'Printed paper sheets commonly collected as dry paper scrap.', false, null, true),
('plastic-bottle', 'Plastic bottle', array['PET bottle', 'Water bottle'], 'A plastic bottle used for drinks, household products, or personal care.', false, null, true),
('aluminium-can', 'Aluminium can', array['Soft drink can', 'Tin can'], 'A lightweight metal beverage or food can.', false, null, true),
('steel-utensil', 'Steel utensil', array['Stainless steel spoon', 'Metal utensil'], 'A household utensil made primarily from steel or stainless steel.', false, null, true),
('copper-wire', 'Copper wire', array['Electrical wire', 'Copper cable'], 'Conductive wire that may be part of a cable or electrical component.', true, 'Do not handle connected or damaged wiring. Use a qualified electrician or authorised e-waste collector.', true),
('glass-bottle', 'Glass bottle', array['Glass jar', 'Bottle'], 'A rigid glass container used for drinks, food, or household products.', false, null, true),
('plastic-chair', 'Plastic chair', array['Plastic stool', 'Plastic furniture'], 'A rigid plastic household chair or stool, sometimes with metal parts.', false, null, true),
('old-books', 'Old books', array['Books', 'Textbooks'], 'Bound paper items that may be reusable, donated, or recycled when damaged.', false, null, true),
('metal-container', 'Metal container', array['Tin container', 'Steel box'], 'A metal storage or food container made from steel or another metal.', false, null, true),
('plastic-bucket', 'Plastic bucket', array['Tub', 'Plastic pail'], 'A rigid reusable plastic household container.', false, null, true),
('old-clothing', 'Old clothing', array['Clothes', 'Garments'], 'Fabric garments that may be reusable, repairable, or unsuitable for further wear.', false, null, true),
('bicycle', 'Bicycle', array['Cycle', 'Bike'], 'A metal-framed vehicle with rubber, plastic, and other attached parts.', false, null, true),
('broken-fan', 'Broken fan', array['Electric fan', 'Table fan'], 'A powered appliance containing metal, plastic, wiring, and a motor.', true, 'Keep unplugged and dry. Use an authorised e-waste collection route; do not open the motor or wiring.', true),
('computer-keyboard', 'Computer keyboard', array['Keyboard', 'USB keyboard'], 'An electronic input device made from plastic, circuits, and wiring.', true, 'Keep dry and intact. Use an authorised e-waste collection route rather than household recycling.', true),
('mobile-phone', 'Mobile phone', array['Cell phone', 'Smartphone'], 'A small electronic device containing a screen, circuit board, and rechargeable battery.', true, 'Do not puncture, crush, heat, or open the phone. Use an authorised e-waste or manufacturer take-back route.', true),
('laptop', 'Laptop', array['Notebook computer', 'Portable computer'], 'A portable computer containing electronics, a screen, and a rechargeable battery.', true, 'Do not dismantle or remove the battery yourself. Use an authorised e-waste channel.', true),
('television', 'Television', array['TV', 'LED TV'], 'An electronic display appliance with circuits, plastics, and a screen.', true, 'Keep intact and dry. Do not break the screen or open the casing; use authorised e-waste handling.', true),
('refrigerator', 'Refrigerator', array['Fridge', 'Freezer'], 'A large appliance containing electrical parts, insulation, refrigerant, and metal.', true, 'Do not cut pipes, remove refrigerant, or dismantle the appliance. Arrange specialist appliance handling.', true),
('lithium-ion-battery', 'Lithium-ion battery', array['Rechargeable battery', 'Power bank battery'], 'A rechargeable battery used in phones, laptops, tools, and power banks.', true, 'If swollen, hot, leaking, or damaged, isolate it safely and contact an authorised e-waste or hazardous-waste service.', true)
on conflict (slug) do nothing;

insert into public.item_materials (item_id, material_id, is_primary)
select i.id, m.id, mapping.is_primary
from (values
  ('cardboard-box', 'cardboard', true), ('newspaper', 'paper', true), ('plastic-bottle', 'plastic', true),
  ('aluminium-can', 'aluminium', true), ('steel-utensil', 'iron-steel', true), ('copper-wire', 'copper', true),
  ('glass-bottle', 'glass', true), ('plastic-chair', 'plastic', true), ('plastic-chair', 'iron-steel', false),
  ('old-books', 'paper', true), ('old-books', 'mixed-materials', false), ('metal-container', 'iron-steel', true),
  ('plastic-bucket', 'plastic', true), ('old-clothing', 'textiles', true), ('bicycle', 'iron-steel', true),
  ('bicycle', 'mixed-materials', false), ('broken-fan', 'electronic-waste', true), ('broken-fan', 'plastic', false),
  ('broken-fan', 'iron-steel', false), ('computer-keyboard', 'electronic-waste', true), ('computer-keyboard', 'plastic', false),
  ('mobile-phone', 'electronic-waste', true), ('mobile-phone', 'mixed-materials', false), ('laptop', 'electronic-waste', true),
  ('laptop', 'mixed-materials', false), ('television', 'electronic-waste', true), ('television', 'mixed-materials', false),
  ('refrigerator', 'electronic-waste', true), ('refrigerator', 'iron-steel', false), ('refrigerator', 'mixed-materials', false),
  ('lithium-ion-battery', 'electronic-waste', true), ('lithium-ion-battery', 'mixed-materials', false)
) as mapping(item_slug, material_slug, is_primary)
join public.items i on i.slug = mapping.item_slug
join public.materials m on m.slug = mapping.material_slug
on conflict (item_id, material_id) do nothing;

insert into public.preparation_guides (slug, item_id, material_id, title, description, preparation_steps, safety_warnings, do_not_do, recommended_route, approval_status, reviewer_notes)
select
  i.slug || '-guide', i.id, primary_material.material_id,
  case when i.is_hazardous then 'How to handle ' || i.name else 'How to prepare ' || i.name end,
  'Conservative draft guidance. This record is pending review and is not expert-approved safety advice.',
  case when i.is_hazardous then array['Keep the item intact, dry, and separate from ordinary household waste.', 'Use an authorised or specialist route for this item.', 'Stop and ask a qualified professional if its condition is uncertain.'] else array['Check that the item is empty, reasonably clean, and dry where practical.', 'Separate obvious attachments only when this can be done safely without tools.', 'Ask the receiving collector what they accept before arranging collection.'] end,
  case when i.is_hazardous then array['This item may contain electrical, battery, refrigerant, sharp, or other hazardous components.'] else array['Stop if the item is sharp, contaminated, pressurised, electrically connected, or otherwise uncertain.'] end,
  case when i.is_hazardous then array['Do not open, crush, burn, heat, puncture, or dismantle the item.'] else array['Do not burn, cut, heat, crush, or dismantle the item just to prepare it for scrap.'] end,
  case when i.is_hazardous then 'Authorised e-waste, hazardous-waste, or specialist appliance service.' else 'Confirm acceptance with a local collection or authorised recycling route.' end,
  'pending_review', 'Pending review by a qualified content reviewer.'
from public.items i
left join lateral (select im.material_id from public.item_materials im where im.item_id = i.id and im.is_primary = true limit 1) primary_material on true
on conflict (slug) do nothing;

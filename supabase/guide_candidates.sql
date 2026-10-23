-- ScrapReady guide candidates for human review.
-- This script intentionally creates pending_review rows only.
-- It does not approve content or change existing approved guides.

insert into public.preparation_guides (
  slug, item_id, material_id, title, description, preparation_steps,
  safety_warnings, do_not_do, recommended_route, approval_status,
  reviewer_notes, content_version
)
select * from (
  select
    'newspaper-guide', i.id, m.id,
    'How to prepare newspapers',
    'Newspapers are dry paper scrap when clean and dry. Local acceptance can vary, especially for wet, mouldy, or heavily contaminated paper.',
    array['Remove food, wet sections, and obvious non-paper attachments where practical.', 'Keep the newspapers dry and bundle them loosely so they can be inspected.', 'Separate them from food waste and mixed wet waste.', 'Confirm acceptance and collection conditions with the receiving collector.'],
    array['Keep paper away from fire and moisture.', 'Do not mix heavily mouldy or chemically contaminated paper with clean recyclables; follow appropriate local waste guidance.'],
    array['Do not burn paper.', 'Do not place heavily mouldy or chemically contaminated paper into a clean paper bundle.'],
    'Confirm with a local paper collector or the applicable local waste channel.',
    'pending_review', 'Candidate content requires human review before approval.', 1
  from public.items i join public.materials m on m.slug = 'paper' where i.slug = 'newspaper'
  union all
  select
    'cardboard-box-guide', i.id, m.id,
    'How to prepare cardboard boxes',
    'Clean, dry cardboard boxes can often be separated as cardboard scrap, but waxed, laminated, wet, or food-soiled board may be handled differently.',
    array['Empty the box and remove loose plastic, foam, and obvious non-cardboard inserts.', 'Flatten the box if it can be done safely without tools.', 'Keep the flattened cardboard dry and separate from wet or food-soiled waste.', 'Ask the receiving collector whether laminated or waxed cardboard is accepted.'],
    array['Use care around staples, tape cutters, and sharp packing edges.', 'Wear gloves if the box is dusty or has sharp fasteners.'],
    array['Do not burn cardboard.', 'Do not force apart bonded layers or use heat or chemicals to remove coatings.'],
    'Confirm with a local cardboard/paper collector or the applicable local waste channel.',
    'pending_review', 'Candidate content requires human review before approval.', 1
  from public.items i join public.materials m on m.slug = 'cardboard' where i.slug = 'cardboard-box'
  union all
  select
    'plastic-bottle-guide', i.id, m.id,
    'How to prepare plastic bottles',
    'Empty plastic bottles may be separated as plastic scrap when the local collector accepts them. Polymer, condition, and local rules affect acceptance.',
    array['Empty the bottle and rinse it when practical.', 'Replace or separate the cap only if the collector requests that sorting.', 'Flatten the bottle only when safe and practical.', 'Keep bottles dry and separate from food waste and hazardous containers.'],
    array['Do not reuse an unknown container for food or drinking water.', 'Pesticide, chemical, and other hazardous containers must not be processed as ordinary plastic bottles.'],
    array['Do not burn plastic.', 'Do not cut, melt, or chemically alter the bottle to prepare it for scrap.'],
    'Confirm acceptance with a local plastic collector or the applicable local waste channel.',
    'pending_review', 'Candidate content requires human review before approval.', 1
  from public.items i join public.materials m on m.slug = 'plastic' where i.slug = 'plastic-bottle'
) candidates
on conflict (slug) do nothing;

-- After a qualified reviewer approves the text, publish one row at a time:
-- update public.preparation_guides
-- set approval_status = 'approved', last_reviewed_date = current_date,
--     reviewer_notes = 'Reviewed and approved by <authorized reviewer>',
--     content_version = content_version + 1
-- where slug in ('newspaper-guide', 'cardboard-box-guide', 'plastic-bottle-guide')
--   and approval_status = 'pending_review';

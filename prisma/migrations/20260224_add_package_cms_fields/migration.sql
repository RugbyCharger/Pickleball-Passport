-- Add CMS rich text content fields to Package table (Epic 12-2)
ALTER TABLE "Package"
  ADD COLUMN "cmsDescription" JSONB,
  ADD COLUMN "cmsPricingText" TEXT,
  ADD COLUMN "cmsDurationText" TEXT,
  ADD COLUMN "cmsHighlights" JSONB,
  ADD COLUMN "cmsIncludedItems" JSONB,
  ADD COLUMN "cmsNotIncludedItems" JSONB;

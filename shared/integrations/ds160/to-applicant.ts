import "server-only";
import type { DS160Applicant } from "./types";

// Form-engine state, as stored in the `formData` Turso row.
export type FormEngineSnapshot = {
  data: Record<string, unknown>;               // flat keys "sectionId.fieldId" → value
  arrayData: Record<string, unknown[]>;        // keys "sectionId.fieldId" → array rows
  visitedSections: string[];
  naFields: string[];
  unknownFields: string[];
};

// Section id used by the form-engine (kebab-case) → DS160Applicant top-level key.
// Not every form section maps to a top-level key (prev-spouse is flattened to array).
const SECTION_MAP: Record<string, keyof DS160Applicant | null> = {
  location: "location",
  personal1: "personal1",
  personal2: "personal2",
  travel: "travel",
  "travel-companions": "travelCompanions",
  "previous-us-travel": "previousUSTravel",
  "address-phone": "addressPhone",
  passport: "passport",
  "us-contact": "usContact",
  family1: "family1",
  "family2-spouse": "spouse",
  "deceased-spouse": "deceasedSpouse",
  "prev-spouse": null, // handled separately — array lifted to top-level previousSpouses
  "work-education1": "workEducation1",
  "work-education2": "workEducation2",
  "work-education3": "workEducation3",
  security: "security",
  "student-exchange": "studentSevis",
  "student-add-contact": "studentContact",
  "temporary-work": "temporaryWork",
  photo: "photo",
  // "additional-info" / "ais-info" are internal — not mapped to CEAC payload.
};

function splitKey(key: string): { section: string; field: string } | null {
  const idx = key.indexOf(".");
  if (idx < 0) return null;
  return { section: key.slice(0, idx), field: key.slice(idx + 1) };
}

export function toDS160Applicant(snapshot: FormEngineSnapshot): DS160Applicant {
  const applicant: Record<string, unknown> = {};
  const sections: Record<string, Record<string, unknown>> = {};

  // 1. Scalar/date fields: unflatten data into per-section objects.
  for (const [flatKey, value] of Object.entries(snapshot.data)) {
    const parts = splitKey(flatKey);
    if (!parts) continue;
    if (!(parts.section in SECTION_MAP)) continue;
    sections[parts.section] ??= {};
    sections[parts.section][parts.field] = value;
  }

  // 2. Array fields: embed array rows into the owning section (or lift).
  for (const [arrayKey, rows] of Object.entries(snapshot.arrayData)) {
    const parts = splitKey(arrayKey);
    if (!parts) continue;
    if (parts.section === "prev-spouse" && parts.field === "spouses") {
      applicant.previousSpouses = rows;
      continue;
    }
    if (!(parts.section in SECTION_MAP)) continue;
    sections[parts.section] ??= {};
    sections[parts.section][parts.field] = rows;
  }

  // 3. Remap section keys to DS160Applicant canonical names.
  for (const [formSectionId, payload] of Object.entries(sections)) {
    const target = SECTION_MAP[formSectionId];
    if (!target) continue;
    applicant[target] = payload;
  }

  // 4. Meta — pass through visitedSections / naFields / unknownFields.
  applicant._meta = {
    visitedSections: snapshot.visitedSections.map((s) => Number.parseInt(s, 10)).filter(Number.isFinite),
    naFields: snapshot.naFields,
    unknownFields: snapshot.unknownFields,
  };

  return applicant as DS160Applicant;
}

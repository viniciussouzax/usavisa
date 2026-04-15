import type { FieldOption, OptionsRef } from "../schema/primitives";
import { COUNTRIES } from "./countries";
import { US_STATES } from "./us-states";
import {
  OCCUPATIONS,
  RELATIONSHIPS,
  RELATIVE_TYPES,
  US_CONTACT_RELATIONSHIPS,
  US_STATUS,
} from "./relationships";

export function resolveOptions(ref: OptionsRef): FieldOption[] {
  switch (ref) {
    case "countries":
      return COUNTRIES;
    case "usStates":
      return US_STATES;
    case "relationships":
      return RELATIONSHIPS;
    case "usContactRelationships":
      return US_CONTACT_RELATIONSHIPS;
    case "relativeTypes":
      return RELATIVE_TYPES;
    case "usStatus":
      return US_STATUS;
    case "occupations":
      return OCCUPATIONS;
  }
}

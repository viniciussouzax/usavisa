import type { FormSchema } from "./primitives";
import { locationSection } from "./sections/location";
import { personal1Section } from "./sections/personal1";
import { personal2Section } from "./sections/personal2";
import { travelSection } from "./sections/travel";
import { travelCompanionsSection } from "./sections/travel-companions";
import { previousUSTravelSection } from "./sections/previous-us-travel";
import { addressPhoneSection } from "./sections/address-phone";
import { passportSection } from "./sections/passport";
import { usContactSection } from "./sections/us-contact";
import { family1Section } from "./sections/family1";
import { family2SpouseSection } from "./sections/family2-spouse";
import { deceasedSpouseSection } from "./sections/deceased-spouse";
import { prevSpouseSection } from "./sections/prev-spouse";
import { workEducation1Section } from "./sections/work-education1";
import { workEducation2Section } from "./sections/work-education2";
import { workEducation3Section } from "./sections/work-education3";
import { securitySection } from "./sections/security";
import { studentExchangeSection } from "./sections/student-exchange";
import { studentAddContactSection } from "./sections/student-add-contact";
import { temporaryWorkSection } from "./sections/temporary-work";
import { photoSection } from "./sections/photo";
import { additionalInfoSection } from "./sections/additional-info";
import { aisInfoSection } from "./sections/ais-info";

export const DS160_SCHEMA: FormSchema = {
  version: "1.1",
  sections: [
    locationSection,
    personal1Section,
    personal2Section,
    travelSection,
    travelCompanionsSection,
    previousUSTravelSection,
    addressPhoneSection,
    passportSection,
    usContactSection,
    family1Section,
    family2SpouseSection,
    deceasedSpouseSection,
    prevSpouseSection,
    workEducation1Section,
    workEducation2Section,
    workEducation3Section,
    securitySection,
    studentExchangeSection,
    studentAddContactSection,
    temporaryWorkSection,
    photoSection,
    additionalInfoSection,
    aisInfoSection,
  ],
};

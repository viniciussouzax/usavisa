import { ADDRESS_PHONE_IDS as ID } from './selectors.js';
import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { isNA } from '../../schema/sentinels.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

export async function runAddressAndPhonePage(ctx: PageContext): Promise<PageHandlerResult> {
    const data = ctx.data.addressPhone;
    if (!data) {
        throw new EngineError('Missing addressPhone data in payload', {
            cause: 'missing_data',
            pageName: '09_address_and_phone',
        });
    }

    return standardPageRun(ctx, {
        pageId: '09_address_and_phone',
        expectedUrlAfter: [/complete_pptvisa|passport/i],
        buildSpec: () => {
            const b = new FieldSpecBuilder();

            b.addText(ID.homeStreet1, data.homeStreet1, { critical: true });
            b.addText(ID.homeStreet2, data.homeStreet2);
            b.addText(ID.homeCity, data.homeCity, { critical: true });
            if (isNA(data.homeState)) {
                b.addCheckbox(ID.homeStateNa, true);
            } else {
                b.addText(ID.homeState, data.homeState);
            }
            if (isNA(data.homePostalCode)) {
                b.addCheckbox(ID.homePostalCodeNa, true);
            } else {
                b.addText(ID.homePostalCode, data.homePostalCode);
            }
            b.addSelectSearch(ID.homeCountry, data.homeCountry);

            b.addRadio(ID.mailingSame, data.mailingAddressSame);
            if (data.mailingAddressSame === 'N') {
                b.addText(ID.mailStreet1, data.mailStreet1, { critical: true });
                b.addText(ID.mailStreet2, data.mailStreet2);
                b.addText(ID.mailCity, data.mailCity, { critical: true });
                if (isNA(data.mailState)) {
                    b.addCheckbox(ID.mailStateNa, true);
                } else {
                    b.addText(ID.mailState, data.mailState);
                }
                if (isNA(data.mailPostalCode)) {
                    b.addCheckbox(ID.mailPostalCodeNa, true);
                } else {
                    b.addText(ID.mailPostalCode, data.mailPostalCode);
                }
                b.addSelectSearch(ID.mailCountry, data.mailCountry);
            }

            if (isNA(data.phone)) {
                b.addCheckbox(ID.homeTelNa, true);
            } else {
                b.addText(ID.homeTel, data.phone, { critical: true });
            }
            if (isNA(data.mobilePhone)) {
                b.addCheckbox(ID.mobileTelNa, true);
            } else {
                b.addText(ID.mobileTel, data.mobilePhone, { critical: true });
            }
            if (isNA(data.businessPhone)) {
                b.addCheckbox(ID.busTelNa, true);
            } else {
                b.addText(ID.busTel, data.businessPhone, { critical: true });
            }

            b.addRadio(ID.addPhoneIndicator, data.additionalPhones);
            const addPhones = data.additionalPhoneNumbers ?? [];
            if (data.additionalPhones === 'Y' && addPhones.length > 0) {
                b.addDataList(ID.addPhoneList, addPhones.length);
                addPhones.forEach((p, i) => b.addText(ID.addPhoneInfo(i), p.phone, { critical: true }));
            }

            b.addText(ID.primaryEmail, data.email);
            b.addRadio(ID.addEmailIndicator, data.additionalEmails);
            const addEmails = data.additionalEmailAddresses ?? [];
            if (data.additionalEmails === 'Y' && addEmails.length > 0) {
                b.addDataList(ID.addEmailList, addEmails.length);
                addEmails.forEach((e, i) => b.addText(ID.addEmailInfo(i), e.email));
            }

            const socials = data.socialMedia ?? [];
            if (socials.length > 0) {
                b.addDataList(ID.socialList, socials.length);
                socials.forEach((s, i) => {
                    b.addSelect(ID.socialPlatform(i), s.platform);
                    b.addText(ID.socialIdent(i), s.handle);
                });
            }

            b.addRadio(ID.addSocialIndicator, data.additionalSocialMedia);
            const addSocials = data.additionalSocialMediaAccounts ?? [];
            if (data.additionalSocialMedia === 'Y' && addSocials.length > 0) {
                b.addDataList(ID.addSocialList, addSocials.length);
                addSocials.forEach((s, i) => {
                    b.addText(ID.addSocialPlat(i), s.platform);
                    b.addText(ID.addSocialHand(i), s.handle);
                });
            }

            const { fields, dataLists } = b.build();
            return { pageId: '09_address_and_phone', fields, dataLists };
        },
    });
}

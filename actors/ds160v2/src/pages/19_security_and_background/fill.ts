// Security and Background — 5 parts. The router loop enters this module up to 5 times,
// once per CEAC URL (part 1 → part 5). Each invocation detects which part by URL
// and fills only that part's questions.

import { FieldSpecBuilder } from '../_helpers/fieldBuilder.js';
import { standardPageRun } from '../_helpers/standardRun.js';
import { EngineError } from '../../logging/errors.js';
import type { PageContext, PageHandlerResult } from '../types.js';

type Part = 1 | 2 | 3 | 4 | 5;

interface Question {
    radioId: string;
    explId: string;
    payloadKey: string;
    explainKey?: string;
}

const PART_QUESTIONS: Record<Part, Question[]> = {
    1: [
        { radioId: 'rblDisease', explId: 'tbxDisease_EXPL', payloadKey: 'disease' },
        { radioId: 'rblDisorder', explId: 'tbxDisorder_EXPL', payloadKey: 'disorder' },
        { radioId: 'rblDruguser', explId: 'tbxDruguser_EXPL', payloadKey: 'drugUser' },
    ],
    2: [
        { radioId: 'rblArrested', explId: 'tbxArrested_EXPL', payloadKey: 'arrested' },
        { radioId: 'rblControlledSubstances', explId: 'tbxControlledSubstances_EXPL', payloadKey: 'controlledSubstances' },
        { radioId: 'rblProstitution', explId: 'tbxProstitution_EXPL', payloadKey: 'prostitution' },
        { radioId: 'rblMoneyLaundering', explId: 'tbxMoneyLaundering_EXPL', payloadKey: 'moneyLaundering' },
        { radioId: 'rblHumanTrafficking', explId: 'tbxHumanTrafficking_EXPL', payloadKey: 'humanTrafficking' },
        { radioId: 'rblAssistedSevereTrafficking', explId: 'tbxAssistedSevereTrafficking_EXPL', payloadKey: 'assistedSevereTrafficking' },
        { radioId: 'rblHumanTraffickingRelated', explId: 'tbxHumanTraffickingRelated_EXPL', payloadKey: 'humanTraffickingRelated' },
    ],
    3: [
        { radioId: 'rblIllegalActivity', explId: 'tbxIllegalActivity_EXPL', payloadKey: 'illegalActivity' },
        { radioId: 'rblTerroristActivity', explId: 'tbxTerroristActivity_EXPL', payloadKey: 'terroristActivity' },
        { radioId: 'rblTerroristSupport', explId: 'tbxTerroristSupport_EXPL', payloadKey: 'terroristSupport' },
        { radioId: 'rblTerroristOrg', explId: 'tbxTerroristOrg_EXPL', payloadKey: 'terroristOrg' },
        { radioId: 'rblTerroristRel', explId: 'tbxTerroristRel_EXPL', payloadKey: 'terroristRel' },
        { radioId: 'rblGenocide', explId: 'tbxGenocide_EXPL', payloadKey: 'genocide' },
        { radioId: 'rblTorture', explId: 'tbxTorture_EXPL', payloadKey: 'torture' },
        { radioId: 'rblExViolence', explId: 'tbxExViolence_EXPL', payloadKey: 'exViolence' },
        { radioId: 'rblChildSoldier', explId: 'tbxChildSoldier_EXPL', payloadKey: 'childSoldier' },
        { radioId: 'rblReligiousFreedom', explId: 'tbxReligiousFreedom_EXPL', payloadKey: 'religiousFreedom' },
        { radioId: 'rblPopulationControls', explId: 'tbxPopulationControls_EXPL', payloadKey: 'populationControls' },
        { radioId: 'rblTransplant', explId: 'tbxTransplant_EXPL', payloadKey: 'transplant' },
    ],
    4: [
        { radioId: 'rblImmigrationFraud', explId: 'tbxImmigrationFraud_EXPL', payloadKey: 'immigrationFraud' },
        { radioId: 'rblDeport', explId: 'tbxDeport_EXPL', payloadKey: 'deport' },
        { radioId: 'rblRemovalHearing', explId: 'tbxRemovalHearing_EXPL', payloadKey: 'removalHearing' },
        { radioId: 'rblFailToAttend', explId: 'tbxFailToAttend_EXPL', payloadKey: 'failToAttend' },
        { radioId: 'rblVisaViolation', explId: 'tbxVisaViolation_EXPL', payloadKey: 'visaViolation' },
    ],
    5: [
        { radioId: 'rblChildCustody', explId: 'tbxChildCustody_EXPL', payloadKey: 'childCustody' },
        { radioId: 'rblVotingViolation', explId: 'tbxVotingViolation_EXPL', payloadKey: 'votingViolation' },
        { radioId: 'rblRenounceExp', explId: 'tbxRENOUNCE_EXPL', payloadKey: 'renounceExp' },
        { radioId: 'rblAttWoReimb', explId: 'tbxAttWoReimb_EXPL', payloadKey: 'attWoReimb' },
    ],
};

function detectPart(url: string): Part {
    const match = url.match(/securityandbackground(\d)/i);
    if (!match) return 1;
    const n = Number.parseInt(match[1]!, 10);
    if (n >= 1 && n <= 5) return n as Part;
    return 1;
}

export async function runSecurityBackgroundPage(ctx: PageContext): Promise<PageHandlerResult> {
    const security = ctx.data.security;
    if (!security) {
        throw new EngineError('Missing security data in payload', {
            cause: 'missing_data',
            pageName: '19_security_and_background',
        });
    }

    const part = detectPart(ctx.page.url());
    const questions = PART_QUESTIONS[part];

    // After part 5 the user advances to visa-specific pages (or straight to Review).
    // The router loop handles the page transition — each invocation here fills ONE part.
    const expectedAfter = part < 5
        ? [new RegExp(`securityandbackground${part + 1}`, 'i')]
        : [
            /student_exchange|sevis/i,
            /temporary_work|tempwork/i,
            /photo|upload/i,
            /review/i,
        ];

    return standardPageRun(ctx, {
        pageId: `19_security_and_background_part${part}`,
        expectedUrlAfter: expectedAfter,
        buildSpec: () => {
            const b = new FieldSpecBuilder();
            for (const q of questions) {
                const value = (security as Record<string, string | undefined>)[q.payloadKey];
                b.addRadio(q.radioId, value ?? 'N');
                if (value === 'Y') {
                    const explain = (security as Record<string, string | undefined>)[q.explainKey ?? `${q.payloadKey}Explanation`];
                    b.addText(q.explId, explain);
                }
            }
            const { fields, dataLists } = b.build();
            return { pageId: `19_security_and_background_part${part}`, fields, dataLists };
        },
    });
}

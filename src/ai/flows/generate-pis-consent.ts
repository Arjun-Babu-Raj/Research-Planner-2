
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating a Participant Information Sheet (PIS)
 * and a Consent Form based on provided templates and study details.
 *
 * - generatePisAndConsent - A function that creates the documents.
 * - GeneratePisAndConsentInput - The input type for the function.
 * - GeneratePisAndConsentOutput - The return type for the function.
 */

import { getAi } from '@/ai/genkit';
import { PIS_TEMPLATE, CONSENT_TEMPLATE } from '@/lib/templates';
import { z } from 'genkit';

const GeneratePisAndConsentInputSchema = z.object({
  studyTitle: z.string().describe('The title of the study.'),
  investigatorName: z.string().describe('The name of the student investigator.'),
  guideName: z.string().describe('The name of the thesis guide.'),
  introduction: z.string().describe('The introduction section of the study plan, providing context.'),
  methodology: z.string().describe('The methodology section of the study plan.'),
  objectives: z.string().optional().describe('The objectives of the study plan.'),
});
export type GeneratePisAndConsentInput = z.infer<typeof GeneratePisAndConsentInputSchema>;

const GeneratePisAndConsentOutputSchema = z.object({
  participantInformationSheet: z.object({
      english: z.string().describe("The generated Participant Information Sheet in English."),
      hindi: z.string().describe("The generated Participant Information Sheet in Hindi."),
  }),
  consentForm: z.object({
      english: z.string().describe("The generated Consent Form in English."),
      hindi: z.string().describe("The generated Consent Form in Hindi."),
  }),
});
export type GeneratePisAndConsentOutput = z.infer<typeof GeneratePisAndConsentOutputSchema>;

async function generateDocument(
    ai: any,
    template: string,
    promptText: string,
    data: any
): Promise<string> {
    const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `${promptText}
        
        **Template:**
        \`\`\`
        ${template}
        \`\`\`

        **Study Details:**
        ${Object.entries(data).map(([key, value]) => `- **${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:** ${value}`).join('\n')}
        `,
        output: {
            schema: z.object({ content: z.string() })
        }
    });

    if (!output) {
        throw new Error('Failed to generate document from template');
    }
    return output.content;
}


export async function generatePisAndConsent(input: GeneratePisAndConsentInput & { apiKey: string }): Promise<GeneratePisAndConsentOutput> {
  const ai = getAi(input.apiKey);

  const pisPromptText = `You are an expert research assistant. Your task is to populate the provided Participant Information Sheet (PIS) template with the specific details of a research study.

**Instructions:**
1.  Carefully review the PIS template and the provided study details.
2.  Your output MUST be ONLY the fully populated PIS text. Do not add any extra commentary, titles, or explanations.
3.  You must replace every placeholder in the template with the corresponding information. The placeholders are:
    - \`[STUDY_TITLE]\`: Use the 'Study Title'.
    - \`[INVESTIGATOR_NAME]\`: Use the 'Investigator Name'.
    - \`[GUIDE_NAME]\`: Use the 'Guide Name'.
    - \`[INTRODUCTION_SUMMARY]\`: Write a concise summary of the 'Study Introduction' suitable for a layperson.
    - \`[OBJECTIVE_SUMMARY]\`: Use the provided 'Study Objectives' to summarize the purpose of the study.
    - \`[METHODOLOGY_SUMMARY]\`: Write a concise summary of the 'Study Methodology' explaining what participants will do.
    - \`[DURATION_ESTIMATE]\`: Based on the methodology, write a placeholder sentence like "Your participation will involve a single session lasting approximately [Estimate time, e.g., 20-30 minutes]."
    - \`[POTENTIAL_BENEFITS]\`: Infer potential benefits from the introduction (e.g., "helping researchers develop better screening packages"). State that there may be no direct personal benefit.
    - \`[CONTACT_INFO]\`: Use the exact placeholder string "[CONTACT_INFO]" in the output. Do not generate a fake phone number.
`;

  const consentPromptText = `You are an expert research assistant. Your task is to populate the provided consent form template with the specific details of a research study.

**Instructions:**
1.  Carefully review the consent form template.
2.  Replace the placeholders \`[STUDY_TITLE]\`, \`[INVESTIGATOR_NAME]\`, and \`[GUIDE_NAME]\` with the actual information provided.
3.  Crucially, for the date, you must use the exact placeholder string \`[CURRENT_DATE]\`. Do not generate or insert the current date.
4.  The output must be ONLY the fully populated consent form text, without any extra commentary or explanations.
`;

  const { apiKey, ...studyData } = input;

  // Generate English PIS
  const pisEnContent = await generateDocument(ai, PIS_TEMPLATE.english, pisPromptText, studyData);

  // Generate Hindi PIS
  const pisHiContent = await generateDocument(ai, PIS_TEMPLATE.hindi, pisPromptText, studyData);
  
  // Generate English Consent
  const consentEnContent = await generateDocument(ai, CONSENT_TEMPLATE.english, consentPromptText, {
      studyTitle: input.studyTitle,
      investigatorName: input.investigatorName,
      guideName: input.guideName,
  });

  // Generate Hindi Consent
  const consentHiContent = await generateDocument(ai, CONSENT_TEMPLATE.hindi, consentPromptText, {
      studyTitle: input.studyTitle,
      investigatorName: input.investigatorName,
      guideName: input.guideName,
  });


  return {
      participantInformationSheet: {
          english: pisEnContent,
          hindi: pisHiContent,
      },
      consentForm: {
          english: consentEnContent,
          hindi: consentHiContent,
      }
  };
}

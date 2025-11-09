
'use server';

/**
 * @fileOverview Defines a Genkit flow for generating a draft questionnaire
 * in XLSFORM format, suitable for platforms like KoboToolbox.
 *
 * - generateXlsForm - A function that creates the XLSFORM data.
 * - GenerateXlsFormInput - The input type for the function.
 * - GenerateXlsFormOutput - The return type for the function.
 */

import { getAi } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  type: z.string().describe("The XLSFORM question type (e.g., 'text', 'integer', 'select_one', 'select_multiple', 'note')."),
  name: z.string().describe("A unique, machine-readable name for the question (e.g., 'participant_age')."),
  label: z.string().describe("The human-readable question text that will be displayed to the user."),
  required: z.boolean().optional().describe("Whether the question is mandatory (true) or optional (false)."),
  hint: z.string().optional().describe("Optional hint or help text for the user."),
  constraint: z.string().optional().describe("An XLSFORM validation constraint (e.g., '. > 18 and . < 65')."),
  constraint_message: z.string().optional().describe("The error message to show if the constraint is violated."),
  appearance: z.string().optional().describe("An appearance hint (e.g., 'likert')."),
  choices: z.array(z.object({
    list_name: z.string().describe("The name of the choice list this option belongs to."),
    name: z.string().describe("The unique value for this choice (e.g., 'yes', 'option_1')."),
    label: z.string().describe("The displayed text for this choice (e.g., 'Yes', 'Option 1').")
  })).optional().describe("An array of choices for 'select_one' or 'select_multiple' questions."),
});

const GenerateXlsFormOutputSchema = z.object({
  survey: z.array(QuestionSchema).describe("An array of questions for the 'survey' sheet of the XLSFORM."),
});
export type GenerateXlsFormOutput = z.infer<typeof GenerateXlsFormOutputSchema>;


const GenerateXlsFormInputSchema = z.object({
  studyTitle: z.string().describe('The title of the study.'),
  objectives: z.string().describe('The specific objectives of the research study.'),
  methodology: z.string().describe('The methodology, including details about data to be collected.'),
});
export type GenerateXlsFormInput = z.infer<typeof GenerateXlsFormInputSchema>;


export async function generateXlsForm(input: GenerateXlsFormInput & { apiKey: string }): Promise<GenerateXlsFormOutput> {
  const ai = getAi(input.apiKey);

  const prompt = ai.definePrompt({
    name: 'generateXlsFormPrompt',
    input: { schema: GenerateXlsFormInputSchema },
    output: { schema: GenerateXlsFormOutputSchema },
    prompt: `You are an expert in creating data collection forms for research using the XLSFORM standard, commonly used in tools like KoboToolbox.

Your task is to generate a draft questionnaire based on the provided study details. The questionnaire must be structured as a valid JSON object that can be converted into an XLSFORM Excel file.

**Study Details:**
- **Title:** {{{studyTitle}}}
- **Objectives:** {{{objectives}}}
- **Methodology:** {{{methodology}}}

**Instructions:**
1.  **Start with Consent:** The very first questions must handle informed consent. Include:
    - A 'note' question type explaining the study's purpose and that participation is voluntary.
    - A 'select_one' question asking for consent to participate (e.g., name: 'consent', label: 'Do you agree to participate?', with choices 'yes' and 'no').
    - Make the consent question mandatory.

2.  **Generate Relevant Questions:** Based on the study's objectives and methodology, create a logical set of questions.
    - Infer the variables mentioned in the methodology (e.g., "Demographic data," "Clinical Variables," "Outcome Measures").
    - For each variable, create one or more questions.
    - Use appropriate question types ('integer', 'text', 'decimal', 'date', 'select_one', 'select_multiple').
    - For demographic data, include standard questions like age, gender, etc.
    - For 'select_one' or 'select_multiple' questions, you MUST define the 'choices' array. All choices for a given question must share the same 'list_name'.

3.  **Structure the Output:**
    - Return a single JSON object with one key: "survey".
    - The value of "survey" must be an array of question objects.
    - Each question object must adhere to the provided schema, including 'type', 'name', and 'label'. Use other fields like 'required', 'hint', and 'constraint' where appropriate to create a high-quality form.

**Example of a single question object:**
{
  "type": "integer",
  "name": "participant_age",
  "label": "What is your age in years?",
  "required": true,
  "constraint": ". > 18",
  "constraint_message": "Participant must be over 18 years old."
}

**Example of a select_one question with choices:**
{
  "type": "select_one",
  "name": "tobacco_use",
  "label": "Do you currently use any tobacco products?",
  "required": true,
  "choices": [
    { "list_name": "yes_no", "name": "yes", "label": "Yes" },
    { "list_name": "yes_no", "name": "no", "label": "No" }
  ]
}

Now, generate the complete JSON output for the study described.
`,
  });

  const { output } = await prompt(input);

  if (!output) {
      throw new Error("The AI failed to generate the XLSFORM data.");
  }

  return output;
}


'use server';

/**
 * @fileOverview A service to search for scholarly articles using an AI model.
 * This is a substitute for a direct Google Scholar API.
 */
import { getAi } from '@/ai/genkit';
import { z } from 'genkit';

const ScholarlyArticleSchema = z.object({
  title: z.string().describe('The title of the article.'),
  authors: z.string().describe('The primary author or authors, formatted as a string (e.g., "Doe J, Smith A").'),
  year: z.string().describe('The year of publication.'),
  journal: z.string().describe('The name of the journal or conference where the article was published.'),
  abstract: z.string().describe('A concise summary of the article abstract.'),
});

type ScholarlyArticle = z.infer<typeof ScholarlyArticleSchema>;

const SearchOutputSchema = z.object({
  articles: z.array(ScholarlyArticleSchema),
});

/**
 * Searches for scholarly articles using an AI prompt.
 * @param query The search query.
 * @param apiKey The user's API key for the AI model.
 * @param maxResults The maximum number of results to return.
 * @returns A promise that resolves to an array of scholarly articles.
 */
export async function searchScholarlyArticles(query: string, apiKey: string, maxResults: number = 5): Promise<ScholarlyArticle[]> {
  const ai = getAi(apiKey);

  const prompt = `You are an expert academic research assistant. Find and summarize up to ${maxResults} relevant, peer-reviewed, open-access scholarly articles based on the following query. For each article, provide the title, authors, publication year, journal/source, and a brief abstract.

Search Query: "${query}"

Prioritize recent and highly cited articles. Provide the output as a valid JSON object.`;

  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      output: {
        schema: SearchOutputSchema,
      }
    });
    return output?.articles || [];
  } catch (error) {
    console.error("Error searching for scholarly articles:", error);
    return [];
  }
}

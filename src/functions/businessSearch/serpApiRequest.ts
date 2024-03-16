import { z } from 'zod';
import { ENVIRONMENT } from '../../utilities/config.js';
import { createError } from '../../utilities/error.js';
import createLogger from '../../utilities/logger.js';
import { SerpApiResultSchema } from './serpSchema.js';

/**
 * Create a logger for this module
 */
const logger = createLogger('lpkg:functions:businessSearch:serpApiRequest');

/**
 * Define the parameters of the request to the SerpApi
 */
type SerpApiRequestParams = {
  /**
   * The name of the business to search for
   */
  name: string;
  /**
   * The location to search for the business
   */
  location: string;
};

/**
 * Define the result of the request to the SerpApi
 */
type SerpApiResult = z.infer<typeof SerpApiResultSchema>;

/**
 * Get the data from the SerpApi and return it as a structured object
 * @param params The parameters to use in the request to the SerpApi
 * @returns The result of the request to the SerpApi - {@link SerpApiResult}
 */
const getSerpApiData = async (
  params: SerpApiRequestParams,
): Promise<SerpApiResult | undefined> => {
  try {
    const query = new URLSearchParams({
      q: `${params.name} ${params.location}`,
      engine: 'google',
      api_key: ENVIRONMENT.SERP_API_KEY,
      hl: 'en',
      gl: 'us',
      google_domain: 'google.com',
    });

    const url = `https://serpapi.com/search?${query}`;
    logger.log('Requesting data from serpApi', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${ENVIRONMENT.SERP_API_KEY}`,
      },
    });

    const data = await response.json();
    logger.log('Got data from serpApi', data);

    const result = SerpApiResultSchema.safeParse(data);
    if (result.success) {
      return result.data;
    } else {
      logger.error(
        createError('Failed to parse data from SerpAPI', result.error),
      );
      return data;
    }
  } catch (e) {
    logger.error(createError('Failed to get data from serpApi', e));
    return undefined;
  }
};

export { getSerpApiData };

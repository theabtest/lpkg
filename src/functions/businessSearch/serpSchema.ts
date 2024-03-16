import z from 'zod';

/**
 * Schema that defines the output of the SerpApi to search for a google result
 *
 * We use this schema to transform the SerpApi result into a more structured and
 * typed object. That way we can safely transform the SerpApi result into a
 * known model.
 */
export const SerpApiResultSchema = z.object({
  search_metadata: z.object({
    id: z.string(),
    processed_at: z.string(),
    google_url: z.string(),
  }),
  knowledge_graph: z.object({
    title: z.string(),
    type: z.string(),
    address: z.string().optional(),
    website: z.string().optional(),
    place_id: z.string(),
    local_map: z
      .object({
        link: z.string(),
        gps_coordinates: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            altitude: z.number(),
          })
          .optional(),
      })
      .optional(),
    profiles: z
      .array(
        z.object({
          name: z.string(),
          link: z.string(),
        }),
      )
      .optional(),
    rating: z.number(),
    review_count: z.number(),
    reviews_from_the_web: z
      .array(
        z.object({
          company: z.string(),
          link: z.string(),
          rating: z.number(),
          review_count: z.number(),
        }),
      )
      .optional(),
    links: z
      .object({
        reserve_a_table: z.string().optional(),
        order_online: z.string().optional(),
      })
      .optional(),
    hours: z
      .object({
        monday: z.object({
          opens: z.string(),
          closes: z.string(),
        }),
        tuesday: z.object({
          opens: z.string(),
          closes: z.string(),
        }),
        wednesday: z.object({
          opens: z.string(),
          closes: z.string(),
        }),
        thursday: z.object({
          opens: z.string(),
          closes: z.string(),
        }),
        friday: z.object({
          opens: z.string(),
          closes: z.string(),
        }),
        saturday: z.object({
          opens: z.string(),
          closes: z.string(),
        }),
        sunday: z.object({
          opens: z.string(),
          closes: z.string(),
        }),
      })
      .optional(),
    phone: z.string().optional(),
    merchant_description: z.string().optional(),
    user_reviews: z
      .array(
        z.object({
          summary: z.string(),
          link: z.string(),
          user: z
            .object({
              name: z.string(),
            })
            .optional(),
        }),
      )
      .optional(),
    people_also_search_for: z.array(
      z.object({
        name: z.string(),
        extensions: z.array(z.string()),
      }),
    ),
  }),
  organic_results: z.array(
    z.object({
      position: z.number(),
      title: z.string(),
      link: z.string(),
      displayed_link: z.string(),
      snippet: z.string(),
      source: z.string(),
      rich_snippet: z
        .object({
          top: z
            .object({
              detected_extensions: z
                .object({
                  rating: z.number().optional(),
                  reviews: z.number().optional(),
                })
                .optional(),
            })
            .optional(),
        })
        .optional(),
    }),
  ),
});

import { SerpApiResultSchema } from './serpSchema.js';

/**
 * Schema that defines the expected object for a business result.
 * We can merge the outputs of multiple search engines into this schema.
 * This schema is used to transform the search results into a known model.
 */
const UrbanhiveBusinessSchema = SerpApiResultSchema.transform(
  (searchResult) => ({
    name: searchResult.knowledge_graph.title,
    type: searchResult.knowledge_graph.type,
    address: searchResult.knowledge_graph.address,
    website: searchResult.knowledge_graph.website,
    googlePlaceId: searchResult.knowledge_graph.place_id,
    phone: searchResult.knowledge_graph.phone,
    merchantDescription: searchResult.knowledge_graph.merchant_description,

    googleMaps: {
      latlng: {
        lat: searchResult.knowledge_graph.local_map?.gps_coordinates?.latitude,
        lng: searchResult.knowledge_graph.local_map?.gps_coordinates?.longitude,
        alt: searchResult.knowledge_graph.local_map?.gps_coordinates?.altitude,
      },
      link: searchResult.knowledge_graph.local_map?.link,
    },
    socialLinks: searchResult.knowledge_graph.profiles,
    ratings: {
      google: {
        rating: searchResult.knowledge_graph.rating,
        reviewCount: searchResult.knowledge_graph.review_count,
      },
      web: searchResult.knowledge_graph.reviews_from_the_web,
    },
    links: searchResult.knowledge_graph.links,
    hours: searchResult.knowledge_graph.hours,

    userReviews: searchResult.knowledge_graph.user_reviews.map((review) => {
      return {
        summary: review.summary,
        link: review.link,
        user: review.user.name,
      };
    }),
    peopleAlsoSearchFor: searchResult.knowledge_graph.people_also_search_for,

    searchResults: searchResult.organic_results,
  }),
);

export { UrbanhiveBusinessSchema };

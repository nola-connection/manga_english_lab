/**
 * Static, MVP-first fixtures for the restaurant scenario (MEL-031).
 *
 * These objects are shaped **exactly** like the JSON returned by the REST API
 * described in `docs/architecture/api-contract.md`, and mirror the domain model
 * in `docs/architecture/data-model.md`. Shipping the client against this module
 * first (per `docs/architecture/frontend-architecture.md`) lets UI work proceed
 * before the backend exists; swapping to the live API is a one-line change
 * behind the identical contract (MEL-082).
 *
 * Notes on parity with the live API:
 * - Server-generated `_id` values on variations/panels are intentionally
 *   omitted here. Static data must not invent IDs (see data-model.md); the
 *   client addresses variations/panels by array position + `order`, and real
 *   `_id`s arrive from the server once the API is wired in.
 * - Media (`imageUrl`, `audioUrl`) are URL/path references only.
 */

/**
 * Full scenario document — mirrors `GET /api/scenarios/:slug` (the value of the
 * response `data` field). Characters, ordered variations, panels, dialogue
 * lines, and glossary are all embedded, matching the fully-embedded model.
 */
const restaurantScenario = {
  slug: "ordering-at-a-restaurant",
  title: "Ordering at a Restaurant",
  summary: "Order food and drinks politely at a casual restaurant.",
  published: true,
  characters: [
    { key: "customer", displayName: "Mia", role: "learner" },
    { key: "waiter", displayName: "Waiter", role: "staff" },
  ],
  variations: [
    {
      key: "polite-basic",
      label: "Polite basics",
      order: 1,
      layoutTemplate: "single",
      panels: [
        {
          order: 1,
          imageUrl: "/media/restaurant/v1/p1.png",
          alt: "A waiter greeting a seated customer and handing over a menu.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "waiter",
              text: "Hi! Are you ready to order?",
              audioUrl: "/media/restaurant/v1/p1-l1.mp3",
              bubble: {
                xPercent: 58,
                yPercent: 12,
                widthPercent: 36,
                tailDirection: "bottom-left",
              },
            },
            {
              order: 2,
              speakerKey: "customer",
              text: "Yes, could I have the tomato soup, please?",
              audioUrl: "/media/restaurant/v1/p1-l2.mp3",
              bubble: {
                xPercent: 8,
                yPercent: 60,
                widthPercent: 42,
                tailDirection: "top-right",
              },
            },
          ],
        },
      ],
    },
    {
      key: "drinks-and-sides",
      label: "Drinks and sides",
      order: 2,
      layoutTemplate: "two-up",
      panels: [
        {
          order: 1,
          imageUrl: "/media/restaurant/v2/p1.png",
          alt: "The waiter standing beside the table, notepad in hand.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "waiter",
              text: "Would you like anything to drink?",
              audioUrl: "/media/restaurant/v2/p1-l1.mp3",
              bubble: {
                xPercent: 54,
                yPercent: 14,
                widthPercent: 40,
                tailDirection: "bottom-left",
              },
            },
            {
              order: 2,
              speakerKey: "customer",
              text: "A bottle of still water, please.",
              audioUrl: "/media/restaurant/v2/p1-l2.mp3",
              bubble: {
                xPercent: 6,
                yPercent: 62,
                widthPercent: 40,
                tailDirection: "top-right",
              },
            },
          ],
        },
        {
          order: 2,
          imageUrl: "/media/restaurant/v2/p2.png",
          alt: "The customer pointing at a side dish on the menu.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "customer",
              text: "Could I also add a side salad?",
              audioUrl: "/media/restaurant/v2/p2-l1.mp3",
              bubble: {
                xPercent: 8,
                yPercent: 12,
                widthPercent: 42,
                tailDirection: "bottom-right",
              },
            },
            {
              order: 2,
              speakerKey: "waiter",
              text: "Of course. Anything else for you?",
              audioUrl: "/media/restaurant/v2/p2-l2.mp3",
              bubble: {
                xPercent: 52,
                yPercent: 64,
                widthPercent: 42,
                tailDirection: "top-left",
              },
            },
          ],
        },
      ],
    },
    {
      key: "full-order",
      label: "A full order",
      order: 3,
      layoutTemplate: "grid-2x2",
      panels: [
        {
          order: 1,
          imageUrl: "/media/restaurant/v3/p1.png",
          alt: "The waiter presenting the menu to the seated customer.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "waiter",
              text: "Good evening. Here is our menu.",
              audioUrl: "/media/restaurant/v3/p1-l1.mp3",
              bubble: {
                xPercent: 50,
                yPercent: 12,
                widthPercent: 44,
                tailDirection: "bottom-left",
              },
            },
          ],
        },
        {
          order: 2,
          imageUrl: "/media/restaurant/v3/p2.png",
          alt: "The customer reading the menu thoughtfully.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "customer",
              text: "What do you recommend as a starter?",
              audioUrl: "/media/restaurant/v3/p2-l1.mp3",
              bubble: {
                xPercent: 8,
                yPercent: 14,
                widthPercent: 46,
                tailDirection: "bottom-right",
              },
            },
          ],
        },
        {
          order: 3,
          imageUrl: "/media/restaurant/v3/p3.png",
          alt: "The waiter gesturing toward a dish on the menu.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "waiter",
              text: "The tomato soup is very popular.",
              audioUrl: "/media/restaurant/v3/p3-l1.mp3",
              bubble: {
                xPercent: 48,
                yPercent: 12,
                widthPercent: 46,
                tailDirection: "bottom-left",
              },
            },
            {
              order: 2,
              speakerKey: "customer",
              text: "That sounds great. I'll have that.",
              audioUrl: "/media/restaurant/v3/p3-l2.mp3",
              bubble: {
                xPercent: 6,
                yPercent: 64,
                widthPercent: 44,
                tailDirection: "top-right",
              },
            },
          ],
        },
        {
          order: 4,
          imageUrl: "/media/restaurant/v3/p4.png",
          alt: "The waiter writing the order on a notepad.",
          dialogueLines: [
            {
              order: 1,
              speakerKey: "customer",
              text: "And the grilled chicken for my main, please.",
              audioUrl: "/media/restaurant/v3/p4-l1.mp3",
              bubble: {
                xPercent: 8,
                yPercent: 12,
                widthPercent: 46,
                tailDirection: "bottom-right",
              },
            },
            {
              order: 2,
              speakerKey: "waiter",
              text: "Excellent choice. I'll bring it right out.",
              audioUrl: "/media/restaurant/v3/p4-l2.mp3",
              bubble: {
                xPercent: 50,
                yPercent: 64,
                widthPercent: 44,
                tailDirection: "top-left",
              },
            },
          ],
        },
      ],
    },
  ],
  glossary: [
    {
      term: "bill",
      definition: "The list of what you must pay at a restaurant.",
      example: "Could we have the bill, please?",
    },
    {
      term: "starter",
      definition: "A small dish eaten before the main course.",
      example: "I'll have the soup as a starter.",
    },
    {
      term: "still water",
      definition: "Plain water without bubbles (not sparkling).",
      example: "A bottle of still water, please.",
    },
  ],
};

/**
 * Lightweight list projection — mirrors `GET /api/scenarios` (the value of the
 * response `data` array). Derived from the full document so the two never drift.
 */
const scenarioList = [
  {
    slug: restaurantScenario.slug,
    title: restaurantScenario.title,
    summary: restaurantScenario.summary,
  },
];

/**
 * Full scenarios keyed by slug, for O(1) lookup by the static access layer
 * (MEL-032). The live API replaces this with a network call by the same slug.
 */
const scenariosBySlug = {
  [restaurantScenario.slug]: restaurantScenario,
};

export { restaurantScenario, scenarioList, scenariosBySlug };

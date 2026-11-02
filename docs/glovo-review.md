# Glovo inspection and Wassel product decisions

Inspection date: 15 October 2026 (UTC).

## Observed public experience

The public [Casablanca restaurant directory](https://glovoapp.com/fr/ma/casablanca/categories/restaurants_1) exposes address selection, cuisine categories, sorting, restaurant listings, percentage recommendation scores, review counts, promotions and open/closed information. It also links merchant and courier entry points and Glovo Prime.

The public [Le Frais MA storefront](https://glovoapp.com/fr/ma/casablanca/stores/le-frais-ma) exposes product categories, product names, MAD prices and delivery information. Its FAQ says the customer sees the cost breakdown before confirming the order. Transparent checkout is therefore not a demonstrated missing Glovo feature.

These observations came from public web pages, not an authenticated purchase, Android package, live browser trace, API reverse engineering or REA Evidence. No order was placed and no account was accessed. Availability and prices vary with location and time. Glovo's internal source, dispatch algorithm, payment behavior, actual service quality and merchant economics remain unknown.

## Implemented alternative

Wassel is an independently branded, mobile-friendly delivery demonstration for Casablanca. It uses fictional merchants, sample reviews, prices and timing. Locally bundled stock photos are illustrative, not merchant photographs. It implements discovery, menu search, categories, sorting, favorites, checkout with complete fee breakdown, a sample discount, server-owned prices, persistent private demo orders, cancellation before acceptance, support issue recording and manual restaurant/courier status changes.

All three roles operate on the signed-in visitor's own demo orders. They are simulation views, not production role authorization. There are no real orders, charges, refunds, courier GPS, dispatch, push/SMS integrations or merchant partnerships. French is the main language; the optional Latin-script Darija toggle translates selected navigation, discovery and checkout labels, not the entire catalog.

## Hypotheses to validate before a pilot

1. A smaller local restaurant selection is easier to browse. Measure time to find and add a meal, not opinions about screenshots.
2. Showing the fixed service fee inside the menu as well as checkout improves price comprehension. Compare customer predictions against the final total.
3. A simple merchant preparation queue helps small restaurants manage orders. Test with real staff before setting turnaround promises.
4. Darija navigation improves comprehension for some customers. Review the language with Casablanca users and compare task completion.

None establishes superiority over Glovo. Reliability, delivery cost, coverage, customer support, courier earnings and restaurant retention require a real operational pilot.

## Suggested first pilot

Start with a single Casablanca neighborhood and a small number of restaurants. Validate contribution margin per order using delivery costs, payment fees, refunds, support, acquisition and merchant commission before choosing fees. Configure production identities and role grants, a payment provider, merchant onboarding, verified courier assignment, customer support and operational monitoring before accepting real orders.

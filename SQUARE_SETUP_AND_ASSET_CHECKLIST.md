# Elevated Beauty By Crystal Website Handoff

## What changed
- Updated the site from Yucca Valley / High Desert primary positioning to Desert Hot Springs primary positioning.
- New primary location: Afterglow Skin and Nails, 64-949 Mission Lakes Blvd Ste 111, Desert Hot Springs, CA 92240.
- Added copy for travel availability across the high and low desert for special occasion services.
- Added new logo assets, cream/black/gold brand styling, lace-style background accents, and gold flourish dividers.
- Added category landing pages with Square service-list placeholders and booking handoff buttons.
- Added social/icon links for Instagram, Facebook, TikTok, YouTube, Google, Yelp placeholder, phone, and map.
- Added active nav JS for desktop and mobile navigation.
- Added Netlify Function at `/.netlify/functions/square-catalog` to safely read Square services without exposing the API key in browser code.

## Netlify environment variables
Set these in Netlify: Site configuration > Environment variables.

Required for Square service listing:
```txt
SQUARE_ACCESS_TOKEN=REPLACE_WITH_PRODUCTION_ACCESS_TOKEN
SQUARE_ENVIRONMENT=production
SQUARE_API_VERSION=2026-05-20
SQUARE_BOOKING_SITE_URL=https://book.squareup.com/appointments/YOUR-SQUARE-BOOKING-SLUG
```

Optional category booking links. Use the Square category/service links Crystal copies from her Online booking site.
```json
SQUARE_CATEGORY_BOOKING_LINKS_JSON={
  "facials": "https://book.squareup.com/...",
  "nails": "https://book.squareup.com/...",
  "extensions": "https://book.squareup.com/...",
  "massage": "https://book.squareup.com/...",
  "brows-lashes-waxing": "https://book.squareup.com/...",
  "special-occasion": "https://book.squareup.com/..."
}
```

Optional individual service booking links. Keys can be Square variation IDs or exact service names.
```json
SQUARE_SERVICE_BOOKING_LINKS_JSON={
  "Signature Facial": "https://book.squareup.com/...",
  "Acrylic Full Set": "https://book.squareup.com/..."
}
```

## Square notes
This build uses Option B: custom website service pages, then Online booking/payment handoff. The browser never receives the Square access token. The Netlify Function reads the online service menu and returns public-facing service names/descriptions/prices/durations plus booking links.

Full custom booking directly inside the website can be added later, but Square seller-level create/update/cancel booking API workflows require a paid Square Appointments plan according to Square's current developer docs.

## Google Maps / Business Profile link
The share link Crystal sent was:
`https://share.google/a6gwm9qBwxdTnxuRP`

For now, the site uses this reliable Maps search URL:
`https://www.google.com/maps/search/?api=1&query=64-949%20Mission%20Lakes%20Blvd%20Ste%20111%2C%20Desert%20Hot%20Springs%2C%20CA%2092240`

Best launch setup:
1. Open Crystal's Google Business Profile in Google Maps.
2. Click Share.
3. Copy the full Maps share link or business profile URL.
4. Replace `google_business_url` / footer Google link with that final URL, or put the final URL anywhere this placeholder appears.
5. After launch, add the exact Google Business Profile URL to schema `sameAs` if it differs from the share link.

## Yelp
Yelp space is reserved. Replace `#yelp-coming-soon` with the live Yelp profile URL when it is created.

## Images/video to create before launch
Recommended assets and where to place them:

1. `assets/img/home-hero-poster.jpg` - wide hero image or branded service photo at Afterglow.
2. `assets/video/home-hero.mp4` - short silent 8-15 second branded beauty video, if you want video hero later.
3. `assets/img/about-crystal.jpg` - portrait of Crystal at Afterglow.
4. `assets/img/afterglow-location.jpg` - exterior/interior location shot.
5. `assets/img/facials-service.jpg` - facial treatment detail.
6. `assets/img/nails-service.jpg` - manicure/pedicure/nails detail.
7. `assets/img/extensions-service.jpg` - nail extension detail.
8. `assets/img/massage-service.jpg` - massage/bodywork setup.
9. `assets/img/brows-lashes-service.jpg` - brow/lash/waxing detail.
10. `assets/img/special-occasion-service.jpg` - event/travel kit/photo prep image.
11. `assets/img/og-image.jpg` - 1200x630 social share graphic using the logo with lace.
12. `assets/img/og-image-square.jpg` - 1200x1200 square social/share graphic.

The current build uses the logo-lace image as the visual fallback so it does not break before these are added.

## Local testing
From the `Website` folder:
```bash
netlify dev
```
Then visit:
`http://localhost:8888/.netlify/functions/square-catalog`

If Square env vars are not set, the function returns `missing_token` and the site displays fallback service items.


<<<<<<< HEAD
## One-location Online booking automapping

Use the location-specific booking URL as the default booking base. Example:

```txt
SQUARE_BOOKING_SITE_URL=https://book.squareup.com/appointments/vjfs1tepkppbbq/location/LGM30Y8TKSR2D
SQUARE_PRIMARY_LOCATION_ID=LGM30Y8TKSR2D
```

The Netlify function will automatically create service-level booking links by appending `/services/{serviceVariationId}` to the location booking URL. It will also use `SQUARE_PRIMARY_LOCATION_ID` to filter out catalog objects that are not available at that location when Square provides location availability metadata.
=======
## Official Square appointment widget

The booking page embeds the official Square Appointments widget:

```html
<script src="https://app.squareup.com/appointments/buyer/widget/muw2pjqg5kbix3/LGM30Y8TKSR2D.js"></script>
```

Use this Netlify value for the fallback/direct booking URL:

```txt
SQUARE_BOOKING_SITE_URL=https://app.squareup.com/appointments/buyer/widget/muw2pjqg5kbix3/LGM30Y8TKSR2D
SQUARE_PRIMARY_LOCATION_ID=LGM30Y8TKSR2D
```

The site no longer guesses service-specific deep links from Catalog IDs. All Book Appointment buttons route to `/booking.html`, where the official widget lets clients choose any available service for the selected location.
>>>>>>> 8fa6d00 (Square Widget)

# Marqo Pro — iOS subscription setup

Implemented October 14, 2026. Android billing is outside this release, as requested.

| Plan | Product ID | Apple product ID | US base price | Duration | Eligible intro offer |
| --- | --- | --- | --- | --- | --- |
| Monthly | `com.artifex.app.pro.monthly` | `6822718343` | $6.00 | 1 month | 7 days free |
| Yearly | `com.artifex.app.pro.yearly` | `6822727080` | $60.00 | 1 year, paid annually | 7 days free |

App Store app: `6814201798`. Subscription group: `22475348` (`Marqo Pro`).
Both subscriptions are at service level 1 and provide identical access.
Both are available in all 175 current App Store regions, explicitly approved by
the user. Intro offers start October 14, 2026 with no scheduled end date.
Apple determines eligibility; customers can redeem only one introductory offer
within the group. Prices and eligibility in the paywall come from StoreKit.

## Behavior

- Every free image export gets the bundled Marqo app icon in the lower-right
  corner, after other canvas elements. All save, share, and batch-export paths
  use the same exporter. A logo-loading failure prevents an unbranded free export.
- Verified active subscriptions, including a verified trial, remove that logo.
- Six premium stickers and six premium stamps are bundled as transparent PNGs.
  Existing assets remain free. The Pro Collection category is visible to everyone.
  Tapping a premium item without verified access shows the paywall inside the
  picker sheet, preserving a clear way back to free editing.
- Premium items keep an `assetId` in projects and history. Exporting a project
  containing premium artwork after access expires opens the paywall.
- Internal gallery thumbnails are rendered without an export logo. They are
  previews of editable projects, not a user export path.
- Settings offers Pro purchase, Restore Purchases, subscription management,
  support email, Privacy Policy, and Terms of Use.

## Billing implementation

`ios/Marqo/MarqoProBilling.swift` exposes StoreKit 2 through the Objective-C bridge.
It accepts only the two known subscription products and uses only `.verified`
transactions from `Transaction.currentEntitlements`. Revoked, upgraded, and
expired transactions are excluded. Only verified recognized transactions are
finished. The subscription group has billing grace periods disabled.

No shared secret, receipt, card information, account credential, or writable Pro
flag is persisted or passed to JavaScript. JavaScript re-reads entitlements after
purchase/restore, on launch, on foreground entry, and on StoreKit updates. A timer
rechecks access at expiry. Pending, cancelled, failed, and unverified purchases do
not unlock Pro. Offline StoreKit's verified local entitlements support current
subscribers; failed verification denies access.

The paywall shows the full monthly/yearly renewal prices, duration, benefits,
trial duration when eligible, automatic-renewal/payment/cancellation terms,
Restore Purchases, functional legal links, and a visible close control. It has no
fake countdown, forced purchase, or promise of a trial to an ineligible customer.
New paywall copy is provided in English and Russian, with English fallback for
other app languages. The generated artwork has no text to localize.

## Public policy and metadata

- Privacy: https://marqo-privacy-policy.anton-chepur.chatgpt.site
- Terms: https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
- Support: gabdullov97@gmail.com

As of October 25, 2026, the privacy-policy URL and
`https://marqo-privacy-policy.anton-chepur.chatgpt.site/support` are saved and
verified for all 29 existing App Store Connect localizations. The public site uses
the exact app icon as its favicon. The localization audit is in
`output/marqo-pro/asc-links-audit-20261025.json`.

The policy is publicly hosted through Sites. Source is in `sites/marqo-privacy`.
Its exact Site project ID is in `.openai/hosting.json` there; reuse that ID when
updating it. Never recreate the Site or save its short-lived write credential.
The privacy URL and subscription/legal disclosures have been saved in the
English (US) App Store metadata. The source policy distinguishes local app data,
Apple billing, voluntary support emails, and website hosting.

## Validation and release status

- Marqo 1.0 build 13 was archived with the existing Apple Distribution identity
  and uploaded successfully to App Store Connect on October 14, 2026. Apple
  confirmed that package processing started. The archive is at
  `build/Marqo-1.0-13.xcarchive`; the matching local IPA is exported under
  `build/Marqo-1.0-13-export`.
- Maestro 2.11.0 passed the native Release-build paywall and premium/export flows
  on iPhone, the Light/Solar/Mono layout flow on iPad, and checkout cancellation
  on iPhone. Screenshots and the actual saved free export are under
  `output/marqo-pro/maestro`. Runnable flows and selectors are in `.maestro`.
- The actual saved PNG was inspected and contains the Marqo app icon in its
  bottom-right corner. Both locked collections open the paywall and return to
  editing on dismissal. Real StoreKit prices and eligible trial offers loaded.
- All six unit suites passed (59 tests). The mobile TypeScript check is clean.
  Generated marketing/video artifacts under `output` have separate environments
  and are excluded from the mobile app's typecheck. Existing lint errors in
  older editor/Home code remain; these do not prevent the native build.
- I fixed grouped accessibility in theme/language pickers, restored the missing
  text-toolbar import/type, initialized the editor's initial-state fields, aligned
  saved-element types with actual stored data, and handled StoreKit's thrown
  cancellation errors as cancellation rather than failed payment.
- Completed purchase/renewal/restore tests are deferred to the user's TestFlight
  run, as explicitly requested. No subscription was confirmed during automation.
- Apple accepted the upload with a non-blocking Hermes-framework dSYM warning.
  The prebuilt Hermes dependency contains no matching dSYM; the app's own dSYM
  is present in the archive.

The subscriptions are drafts, not released. A genuine native screenshot is saved
at `output/marqo-pro/paywall-native-review.png`. Chrome's App Store Connect session
expired during QA, so attaching the screenshot and visually confirming build
processing requires sign-in again. The first subscription group must be included
with the app version when submitting for Apple review. The app's overall release
metadata, including its privacy questionnaire, also needs its normal release review.

Apple references:

- https://developer.apple.com/app-store/subscriptions/
- https://developer.apple.com/help/app-store-connect/manage-subscriptions/set-up-introductory-offers-for-auto-renewable-subscriptions
- https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase

## Artwork provenance

All twelve new assets were generated with the built-in imagegen tool for this
project. Individual prompts and asset paths are recorded in
`output/marqo-pro/artwork-manifest.json`. The full visual preview is
`output/marqo-pro/premium-contact-sheet.png`.

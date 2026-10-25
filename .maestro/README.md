# Marqo iOS Maestro tests

Use a dedicated iOS simulator with a free account state. The app has no login of
its own. Do not use `clearState` to assume an Apple sandbox account has signed out.

Maestro 2.11.0 was used with Java 21. Java 17+ is supported. On this machine the
runtime is `/tmp/marqo-maestro-runtime/maestro/bin/maestro` and Java is available
in Android Studio's `Contents/jbr/Contents/Home`. The runtime is temporary; install
the official Maestro CLI for future runs.

Seed an app-owned photo with `xcrun simctl addmedia <UDID>
src/assets/premium/stickers/crystal-heart.png`. Install a Release simulator build
and then run:

```sh
maestro --device <UDID> test .maestro/pro-paywall.yaml .maestro/pro-assets-export.yaml
maestro --device <UDID> test .maestro/pro-theme-layout.yaml
maestro --device <UDID> test .maestro/pro-checkout-cancel.yaml
```

| Flow | Checks |
| --- | --- |
| `pro-paywall.yaml` | Settings entry, prices/plans, legal controls, scrolling, dismissal |
| `pro-assets-export.yaml` | Language change, both locked collections, return to editing, export paywall, saved free image |
| `pro-theme-layout.yaml` | Light/Solar/Mono, accessible theme options, scrolling/legal footer |
| `pro-checkout-cancel.yaml` | Native Apple checkout/sign-in, cancellation, purchase button recovers, no Pro unlock |

`flows/launch.yaml` uses the visible Home control as the ready marker, handles
onboarding when present, and includes the short post-launch swipe to avoid iOS
XCTest cold-start races. System alerts use text; localized app controls use IDs.
Cancellation uses Maestro's documented `retryTapIfNoChange` for early native taps.

Selectors: `home-settings`, `home-new-project`, `onboarding-skip`,
`settings-close`, `settings-pro`, `settings-language`, `settings-language-{code}`,
`settings-theme`, `settings-theme-{theme}`, `image-picker-photo-{index}`,
`editor-export`, `editor-tool-{tool}`, `sticker-category-{id}`,
`stamp-category-{id}`, `asset-{id}`, `pro-paywall`, `paywall-close`,
`restore-purchases`, `plan-yearly`, `plan-monthly`, `subscribe-pro`,
`paywall-terms`, `paywall-privacy`, `export-pro`, and `export-save`.

Results/screenshots are under `output/marqo-pro/maestro`. The saved export is
`free-export-native.png`; it was inspected for the bottom-right app logo. No paid
subscription was confirmed. Completed purchase/renewal/restore testing is deferred
to the user's TestFlight run, as requested. The CLI flows never approve a payment.

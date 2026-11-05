# Project documentation

Studying the code before making changes? Start with the [complete file/function study guide](study-guide.md): reading order, plain-language function explanations, app data flows and every tracked file in the audited source snapshot.

First backend test: [Supabase setup and testing on Windows](supabase-setup.md), including safe setup/check commands and optional interactive provider tests.

Optional online services: [Geoapify routes, Open-Meteo forecasts and Mistral setup](travel-services.md). Backend keys and deployment are separate from app installation.

Read these in order when joining the project.

For the selected blue UI, start with [PC and Android run instructions](running.md), [Discovery Lens implementation and database roadmap](discovery-lens.md), and the [validation record](ui-validation.md).

Latest implementation: [Destination discovery redesign and API audit](destination-discovery-review.md). Previous milestone: [Discovery Lens usability polish](ui-polish-review.md).

Development troubleshooting: [Windows Metro open-file and cache recovery](metro-troubleshooting.md).

UI/map troubleshooting: [Empty text nodes, map loading and API keys](rendering-and-map-recovery.md).

| Document                                            | What it explains                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| [System walkthrough](architecture.md)               | Screens, data flow, functions, state, storage and where to change behavior |
| [Development and exercises](development.md)         | Setup, learning milestones, checks and the device test checklist           |
| [Implementation review](review.md)                  | Current capabilities, validation evidence, limitations and next priorities |
| [Play Store and website](deployment.md)             | APK testing, Android App Bundles, store preparation and web hosting        |
| [Offline maps and routes](offline-routing.md)       | What works offline now and how to add downloadable routes later            |
| [Design and content credits](design-and-credits.md) | Visual rules, reference links, sources and photo licensing                 |

The UI uses the **MAPPER / Northern Trails** identity. A final public brand and store identifiers should be chosen before the first store release.

These documents belong with the source code in GitHub. Update the relevant document in the same change as the behavior it describes. GitHub maintenance happens during project work and through the configured checks; no unattended maintenance agent is configured.

Current milestone: [Woven design and themes](woven-theme.md) and [hidden-place contributions](hidden-places.md). Read these before configuring community uploads.

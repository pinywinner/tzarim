# Tzarim Wear OS V2.0 Specification

## Product vision
Tzarim V2.0 is a unified contraction-tracking system in which the phone and Wear OS watch are two interfaces to the same session. The watch is optimized for fast, low-friction capture. The phone remains the richer analysis and sharing interface.

## Release roadmap
### V1.5 - Wear Foundation
- Migrate Wear UI to Wear Compose Material 3.
- Establish clean data/domain/UI/sync layers.
- Define shared session and contraction contracts.
- Reliable local persistence.
- Round and rectangular Wear displays.
- Hebrew RTL and accessibility.

### V1.6 - Synchronization
- Phone <-> Watch synchronization through Wear Data Layer.
- Event-based synchronization.
- Offline-first behavior.
- Pending event queue and acknowledgements.
- Idempotent event processing.
- Duplicate prevention and conflict handling.

### V1.7 - Watch UX
- Home screen.
- Active contraction screen.
- Rest/interval screen.
- Recent contractions.
- Optional intensity editing after capture.
- Haptics and screen wake behavior.
- Error/undo affordance.

### V1.8 - Wear OS Native Features
- Tile for rapid access.
- Optional Complication.
- Deep links from watch to relevant phone screens.
- Battery and background-work optimization.

### V1.9 - QA
- Unit tests.
- Sync integration tests.
- Offline/reconnect tests.
- Cross-device event ordering tests.
- Battery-loss/recovery tests.
- RTL and display-size tests.
- Upgrade/install tests.

### V2.0 - Release
- Production Android + Wear OS release.
- Signed release artifacts.
- Google Play distribution.
- Store assets and screenshots.
- Privacy and release documentation.
- CI/CD release pipeline.
- Release notes.

## Responsibilities
### Phone
- Full session management.
- Detailed history and analytics.
- Water-break tracking.
- Intensity management.
- 5-1-1 and 7-0.75-0.5 analysis.
- Sharing/export.
- Detailed settings.

### Watch
- Start contraction.
- Stop contraction.
- Live duration.
- Current interval.
- Recent contraction summary.
- Lightweight history.
- Haptics.
- Offline capture.
- Synchronization status.

The watch should not become a miniature phone dashboard.

## Canonical data model
Contraction fields: id, startedAt, endedAt, intensity, source, updatedAt.
Session fields: id, startedAt, endedAt, contractions, waterBrokeAt, updatedAt.
Source is provenance metadata, not authority.

## Synchronization model
Use event-based synchronization rather than full state snapshots.
Each SyncEvent contains eventId, entityId, deviceId, operation, timestamp and payload.
Events must be idempotent. Every device persists outgoing events until acknowledged. Previously processed events are no-ops. Reconnection reconciles pending events. Ordering is deterministic when timestamps collide. Device clocks are not treated as perfectly authoritative.

## Conflict strategy
Prefer field/entity-level merge over whole-session replacement. A contraction is the smallest independently synchronized entity. If both devices update the same contraction, use deterministic last-write-wins using updatedAt plus a stable event/device tie-breaker. A stale full snapshot must never overwrite newer contractions.

## Offline behavior
The watch remains useful without a phone connection. Capture locally, persist immediately, enqueue a sync event, continue normal UX, transmit pending events on reconnection, receive missing phone events, apply idempotently, and acknowledge successfully processed events.

## Watch UX
Home: current interval/recent contraction and one primary action.
Active contraction: large elapsed timer, clear active state, large Stop action, minimal secondary actions.
Recent data: compact list of recent contractions and intervals.
Intensity: add or edit after capture without interrupting primary capture flow.

## Wear OS native features
Tile: primary quick-entry surface for starting a contraction.
Complication: optional glanceable state only.
Deep links: rich analysis actions open the appropriate phone screen.

## Engineering constraints
Keep existing contraction business rules stable unless a bug is found. Avoid unnecessary duplication between React and Kotlin. Define a platform-neutral data contract. Keep watch storage bounded and resilient. Minimize background work and battery consumption. Preserve existing user data during upgrades.

## QA matrix
Test start/end on watch and phone, cross-device start/end, disconnected capture, reconnect after offline events, duplicate delivery, simultaneous actions, watch process death, battery loss/restart, phone process death, clock changes, RTL, multiple display sizes, and upgrades.

## Definition of Done
V2.0 is complete when phone and watch represent the same session correctly, offline capture is reliable, synchronization is idempotent and tested, duplicate paths are eliminated, core watch flows require minimal interaction, existing phone functionality remains intact, Wear UI is production-ready with Material 3, Tile and deep links are tested, and release artifacts/store materials are ready.

---
title: Canvas
description: Spatial visualization of your knowledge graph using semantic and tag relationships.
---

Canvas is a spatial visualization of your knowledge graph. It gives you a bird's-eye view of atoms, tags, clusters, and semantic relationships.

## Layouts

The default **Islands** layout groups semantic communities into separate visual territories. Atoms retain their relative semantic shape within each island, while the islands themselves are packed apart so related communities can be read independently.

Use **Semantic map** when you want the original global PCA projection, where nearby atoms are semantically close across the entire knowledge base.

In Islands mode, only connections within a community show by default. Turn on **Show bridges** to reveal cross-community relationships.

## Clusters and tags

- **Islands and boundaries** represent semantic clusters.
- **Node size** reflects graph connectivity.
- **Node colour** can represent top-level tag categories (Topics, People, Locations, Organizations, Events) or semantic clusters.
- **Focus** isolates one semantic cluster; choose All clusters to return to the overview.
- Selecting a tag in the sidebar still highlights matching atoms. On the canvas, **Isolate selected tag** hides unrelated atoms.

## Layout updates

The primary canvas layout is calculated from embeddings and semantic edges, so it updates as the knowledge base changes. Visual preferences such as layout and colour mode are remembered locally.

Atomic also exposes persisted atom-position and hierarchical canvas APIs for clients that need them. The desktop canvas uses the computed graph data so it can reflect new embeddings and semantic edges automatically.

## Interaction

- **Zoom and pan** - Navigate the graph with mouse or trackpad.
- **Click** - Select an atom to view its content.
- **Hover** - Highlight an atom's direct neighborhood.
- **Filter** - Scope the canvas to specific tags.

## Graph APIs

Canvas and graph views use these API groups:

- `GET /api/canvas/positions`
- `PUT /api/canvas/positions`
- `GET /api/canvas/atoms-with-embeddings`
- `POST /api/canvas/level`
- `GET /api/canvas/global`
- `GET /api/graph/edges`
- `GET /api/graph/neighborhood/{atom_id}`
- `POST /api/graph/rebuild-edges`
- `POST /api/clustering/compute`
- `GET /api/clustering`

If the graph looks empty, check that embeddings and semantic edges have completed. Rebuilding edges queues recomputation for atoms with embeddings.

## Related

- [Semantic Search](/concepts/semantic-search/)
- [Tags](/concepts/tags/)
- [API Overview](/api/overview/)

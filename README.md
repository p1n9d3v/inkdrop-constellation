# Constellation

Interactive note graph for [Inkdrop](https://www.inkdrop.app/). See your notes as a 3D neural constellation of linked ideas — grouped by notebook, colored by tag, and sized by connectivity.

![Sidebar pane with outline and graph](https://raw.githubusercontent.com/p1n9d3v/inkdrop-constellation/main/images/img2.png)

## Features

- **3D brain-shaped graph** of every note, with clickable particles that open the corresponding note in the editor.
- **Automatic link detection** — parses `inkdrop://note/<id>` references inside each note's body to build edges. Bidirectional links are merged into a single edge with arrows on both ends.
- **Tag-based coloring** — particle color comes from the first tag, while faint neural lines keep the overall brain form readable.
- **Notebook regions** — each notebook is drawn as a subtle 3D region with its name as a label.
- **Degree sizing** — the most connected notes appear as larger glowing hub particles.
- **Hover context** — hover nodes or edges to see note and connection titles, with neighboring particles and edges highlighted.
- **Outline pane** — a clean, clickable heading list for the currently open note, synced to the editor.
- **Two placements** — a persistent right-side pane, plus a full-screen modal for focused exploration.
- **Toggles** — hide orphan nodes and show/hide notebook regions, live.

![Full-screen modal view](https://raw.githubusercontent.com/p1n9d3v/inkdrop-constellation/main/images/img1.png)

## Requirements

**Inkdrop 6.0.0 or later is required** — typically available in [Inkdrop Canary](https://www.inkdrop.app/canary). The plugin uses CodeMirror 6 APIs (`editor.state.doc`, `editor.dispatch`, etc.) that are not available in Inkdrop 5.x. Installing on an older Inkdrop will fail the `engines.inkdrop` compatibility check.

## Installation

```
ipm install constellation
```

Or from Inkdrop → **Preferences → Plugins** → search for _constellation_.

## Usage

### Sidebar pane

Once installed, Constellation appears as a pane on the right side of the editor. The top half shows the outline of the current note, the bottom half shows the full note graph.

- Click any particle to open that note in the editor.
- Scroll to zoom; drag the graph to rotate the 3D brain view.
- **↻** — refresh the graph from the current database state.
- **⤢** — open the full-screen modal view.
- **▶** — collapse the pane to a narrow strip.

### Modal view

Open from the command palette:

```
Constellation: Toggle Modal
```

Press `Esc` or click outside to close. Clicking a node opens the note and closes the modal.

### Outline pane

The outline is extracted from the current note's markdown headings. Click any heading to jump the editor's cursor to that line. Code-fenced content is skipped so headings inside code blocks don't pollute the list.

### What counts as a link

Constellation parses every note's body for `inkdrop://note/<id>` references — the standard URL produced by Inkdrop's **Copy Note Link** command and common link-generating plugins. Links inside fenced or inline code blocks are ignored. Self-references and references to non-existent notes are skipped.

## License

MIT — see [LICENSE](./LICENSE).

import figma, { html } from '@figma/code-connect/html'

// TopicTree (CC) — code-first 2026-10-20 (TASK-571925), drawn in Figma 2026-11-05.
// TopicTree.js renders every row: TopicTree.mount(ul, { …, onSelect }). The rows below are what it
// produces; data-level drives the indent (icon-size-sm + spacing-2 per level).

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4936-44791', {
  example: () => html`<ul class="topic-tree" data-topic-tree></ul>
<script>
  var d = window.TOPIC_TREE_DATA;
  TopicTree.mount(document.querySelector('[data-topic-tree]'), {
    topics: d.topics, children: d.children, parents: d.parents,
    label: 'Affino Taxonomy topics',
    onSelect: function (topic, path) { /* the host shows the topic's details */ },
  });
</script>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4936-44773', {
  variant: { Expandable: 'Closed' },
  props: { name: figma.string('Name') },
  example: ({ name }) => html`<li role="treeitem" aria-expanded="false" aria-selected="false"><div class="topic-tree__item" data-level="1"><span class="topic-tree__chevron" data-topic-tree-toggle aria-hidden="true"><i data-lucide="chevron-right"></i></span><span class="topic-tree__name">${name}</span></div></li>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4936-44773', {
  variant: { Expandable: 'Open' },
  props: { name: figma.string('Name') },
  example: ({ name }) => html`<li role="treeitem" aria-expanded="true" aria-selected="false"><div class="topic-tree__item" data-level="1"><span class="topic-tree__chevron" data-topic-tree-toggle aria-hidden="true"><i data-lucide="chevron-right"></i></span><span class="topic-tree__name">${name}</span></div><ul role="group"></ul></li>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4936-44773', {
  variant: { Expandable: 'Leaf' },
  props: { name: figma.string('Name') },
  example: ({ name }) => html`<li role="treeitem" aria-selected="false"><div class="topic-tree__item" data-level="1"><span class="topic-tree__spacer" aria-hidden="true"></span><span class="topic-tree__name">${name}</span></div></li>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4936-44790', {
  variant: { Type: 'Loading' },
  example: () => html`<li class="topic-tree__status" role="none"><div class="topic-tree__item" data-level="2"><span class="topic-tree__spacer" aria-hidden="true"></span><span class="spinner spinner--sm spinner--neutral" aria-hidden="true"></span><span class="topic-tree__status-text" role="status">Loading topics…</span></div></li>`,
})

figma.connect('https://www.figma.com/design/Lus07xi8pPXLN87sQIyrEt/Affino---Design-System?node-id=4936-44790', {
  variant: { Type: 'Show more' },
  example: () => html`<li class="topic-tree__status" role="none"><div class="topic-tree__item" data-level="1"><span class="topic-tree__spacer" aria-hidden="true"></span><button type="button" class="btn btn--tertiary btn--xs topic-tree__more">Show 12 more</button><span class="topic-tree__status-text">8 of 20</span></div></li>`,
})

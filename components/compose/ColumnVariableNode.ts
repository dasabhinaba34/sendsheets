import { Node, mergeAttributes } from '@tiptap/core';

export const ColumnVariableNode = Node.create({
  name: 'columnVariable',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true, // treated as a single unit — one backspace deletes it

  addAttributes() {
    return {
      label: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-column-variable]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-column-variable': node.attrs.label,
        class: 'column-variable-chip',
      }),
      `@${node.attrs.label as string}`,
    ];
  },

  // When converting to plain text (for email sending), emit @label
  renderText({ node }) {
    return `@${node.attrs.label as string}`;
  },
});

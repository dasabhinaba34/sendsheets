import { Extension } from '@tiptap/core';
import Suggestion, { SuggestionOptions } from '@tiptap/suggestion';

export function buildColumnSuggestionExtension(
  suggestionOptions: Partial<SuggestionOptions>
) {
  return Extension.create({
    name: 'columnSuggestion',
    addOptions() {
      return { suggestion: suggestionOptions };
    },
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          char: '@',
          allowSpaces: false,
          startOfLine: false,
          ...this.options.suggestion,
        }),
      ];
    },
  });
}

import { useEffect, useMemo, useRef } from 'react';
import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { sql, PostgreSQL } from '@codemirror/lang-sql';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { autocompletion } from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';
import type { SchemaNode } from '../lib/types';

const sqlHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword,             color: '#0550ae', fontWeight: '600' },  // SELECT, FROM, WHERE, etc.
  { tag: tags.typeName,            color: '#0550ae' },                     // INT, TEXT, etc.
  { tag: tags.operatorKeyword,     color: '#0550ae', fontWeight: '600' },  // AND, OR, NOT, IN
  { tag: tags.controlKeyword,      color: '#8250df', fontWeight: '600' },  // CASE, WHEN, THEN, ELSE
  { tag: tags.definitionKeyword,   color: '#8250df', fontWeight: '600' },  // CREATE, ALTER, DROP
  { tag: tags.moduleKeyword,       color: '#8250df', fontWeight: '600' },  // SCHEMA, TABLE
  { tag: tags.string,              color: '#0a3069' },                     // 'string literals'
  { tag: tags.number,              color: '#0550ae' },                     // 123, 45.6
  { tag: tags.bool,                color: '#0550ae', fontWeight: '600' },  // TRUE, FALSE
  { tag: tags.null,                color: '#6e7781', fontStyle: 'italic' },// NULL
  { tag: tags.operator,            color: '#24292f' },                     // =, <, >, +, -, etc.
  { tag: tags.punctuation,         color: '#24292f' },                     // (, ), ;, ,
  { tag: tags.labelName,           color: '#116329' },                     // column/table names
  { tag: tags.name,                color: '#24292f' },                     // identifiers
  { tag: tags.comment,             color: '#6e7781', fontStyle: 'italic' },// -- comments, /* */
  { tag: tags.lineComment,         color: '#6e7781', fontStyle: 'italic' },
  { tag: tags.blockComment,        color: '#6e7781', fontStyle: 'italic' },
  { tag: tags.special(tags.string), color: '#0a3069' },                   // quoted identifiers
  { tag: tags.standard(tags.name), color: '#8250df' },                    // built-in functions
]);

const lightTheme = EditorView.theme({
  '&': {
    fontSize: '12px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    height: '100%',
    backgroundColor: 'white',
  },
  '.cm-content': {
    padding: '12px',
    caretColor: 'black',
  },
  '.cm-cursor': {
    borderLeftColor: 'black',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-gutters': {
    backgroundColor: 'white',
    color: '#d1d5db',
    border: 'none',
    paddingLeft: '4px',
  },
  '.cm-activeLine': {
    backgroundColor: '#f8f9fa',
  },
  '.cm-selectionBackground': {
    backgroundColor: '#b4d5fe !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: '#b4d5fe !important',
  },
  '.cm-line': {
    lineHeight: '1.6',
  },
  '.cm-tooltip-autocomplete': {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '12px',
    border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  '.cm-tooltip-autocomplete ul li': {
    padding: '3px 8px',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: '#3794ff',
    color: 'white',
  },
  '.cm-completionIcon': {
    width: '1em',
    marginRight: '4px',
  },
});

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: (currentText: string) => void;
  databaseTree?: SchemaNode[];
}

function buildSqlSchema(tree: SchemaNode[]): Record<string, string[]> {
  const schema: Record<string, string[]> = {};
  for (const s of tree) {
    for (const t of s.tables) {
      const qualified = `${s.name}.${t.name}`;
      const cols = t.columns.map((c) => c.name);
      schema[qualified] = cols;
      // Also register unqualified name for convenience
      if (!schema[t.name]) {
        schema[t.name] = cols;
      }
    }
  }
  return schema;
}

export function SqlEditor({ value, onChange, onRun, databaseTree }: SqlEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const sqlCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);

  onChangeRef.current = onChange;
  onRunRef.current = onRun;

  const sqlSchema = useMemo(() => buildSqlSchema(databaseTree ?? []), [databaseTree]);

  useEffect(() => {
    if (!containerRef.current) return;

    const runKeymap = keymap.of([
      {
        key: 'Ctrl-Enter',
        run: (view) => {
          onRunRef.current(view.state.doc.toString());
          return true;
        },
      },
    ]);

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        runKeymap,
        keymap.of(defaultKeymap),
        keymap.of(historyKeymap),
        history(),
        sqlCompartment.current.of(sql({ dialect: PostgreSQL, schema: sqlSchema })),
        autocompletion(),
        syntaxHighlighting(sqlHighlightStyle),
        lineNumbers(),
        lightTheme,
        cmPlaceholder('Enter SQL query...'),
        updateListener,
        EditorView.lineWrapping,
        EditorView.domEventHandlers({
          drop(event, view) {
            const tableName = event.dataTransfer?.getData('text/plain');
            if (!tableName) return false;
            event.preventDefault();
            const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }) ?? view.state.doc.length;
            view.dispatch({ changes: { from: pos, insert: tableName } });
            return true;
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: sqlCompartment.current.reconfigure(
        sql({ dialect: PostgreSQL, schema: sqlSchema }),
      ),
    });
  }, [sqlSchema]);

  return (
    <div
      ref={containerRef}
      className="min-h-0 flex-1 overflow-auto"
    />
  );
}

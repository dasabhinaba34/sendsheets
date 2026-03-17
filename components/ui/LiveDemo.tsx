'use client';

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, FileSpreadsheet, Mail, RotateCcw } from 'lucide-react';

const CONTACTS = [
  { name: 'Sarah Chen',   company: 'Acme Corp',  role: 'CTO',      email: 'sarah@acme.com'     },
  { name: 'James Park',   company: 'TechFlow',   role: 'Founder',  email: 'james@techflow.io'  },
  { name: 'Priya Sharma', company: 'StartupX',   role: 'CEO',      email: 'priya@startupx.co'  },
  { name: 'Lucas Müller', company: 'DataLabs',   role: 'VP Sales', email: 'lucas@datalabs.de'  },
];

const SUBJECT = 'Hey @name, a quick note';
const BODY    = `Hi @name,\n\nSaw that @company has been growing fast — congrats on that.\n\nAs @role, I thought this might be useful for your team. Happy to share more details.\n\nWould love to find 15 minutes this week?`;

type Contact = typeof CONTACTS[0];
type SendState = 'idle' | 'sending' | 'done';

// Render template text, highlighting @variables or replacing with real values
function TemplateSpans({ text, contact, resolve }: { text: string; contact: Contact; resolve: boolean }) {
  const parts = text.split(/(@\w+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (!part.startsWith('@')) return <span key={i}>{part}</span>;
        if (resolve) {
          const key = part.slice(1) as keyof Contact;
          return (
            <span key={i} className="font-semibold text-green-700 bg-green-100 rounded px-0.5">
              {contact[key] ?? part}
            </span>
          );
        }
        return (
          <span key={i} className="font-mono text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded border border-green-200">
            {part}
          </span>
        );
      })}
    </>
  );
}

export function LiveDemo() {
  const [selected,       setSelected]       = useState(0);
  const [sendState,      setSendState]       = useState<SendState>('idle');
  const [sentRows,       setSentRows]        = useState<Set<number>>(new Set());
  const [userInteracted, setUserInteracted]  = useState(false);
  const [previewVisible, setPreviewVisible]  = useState(true);

  // Auto-cycle rows until user interacts
  useEffect(() => {
    if (userInteracted || sendState !== 'idle') return;
    const id = setInterval(() => setSelected(p => (p + 1) % CONTACTS.length), 2200);
    return () => clearInterval(id);
  }, [userInteracted, sendState]);

  // Fade-swap the preview whenever the selected row changes
  useEffect(() => {
    setPreviewVisible(false);
    const t = setTimeout(() => setPreviewVisible(true), 130);
    return () => clearTimeout(t);
  }, [selected]);

  const selectRow = (i: number) => {
    if (sendState !== 'idle') return;
    setSelected(i);
    setUserInteracted(true);
  };

  const handleSend = async () => {
    if (sendState !== 'idle') return;
    setUserInteracted(true);
    setSendState('sending');
    const sent = new Set<number>();
    for (let i = 0; i < CONTACTS.length; i++) {
      setSelected(i);
      await new Promise(r => setTimeout(r, 620));
      sent.add(i);
      setSentRows(new Set(sent));
    }
    setSendState('done');
  };

  const handleReset = () => {
    setSendState('idle');
    setSentRows(new Set());
    setSelected(0);
    setUserInteracted(false);
  };

  const contact = CONTACTS[selected];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden shadow-xl shadow-gray-200/60 max-w-4xl mx-auto text-left select-none">

      {/* Window chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2.5 flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="ml-4 flex-1 bg-white border border-gray-200 rounded px-3 py-1 text-xs text-gray-400">
          sendsheets.app/compose
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">

        {/* ── Left: Sheet + template ── */}
        <div className="p-5 space-y-3">

          {/* Sheet label */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" />
            contacts.xlsx · {CONTACTS.length} rows
          </div>

          {/* Subject template */}
          <div className="bg-white rounded-lg border border-gray-200 px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Subject</div>
            <div className="text-sm text-gray-700">
              <TemplateSpans text={SUBJECT} contact={contact} resolve={false} />
            </div>
          </div>

          {/* Spreadsheet table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-3 py-2 text-gray-400 font-medium">name</th>
                  <th className="text-left px-3 py-2 text-gray-400 font-medium">company</th>
                  <th className="text-left px-3 py-2 text-gray-400 font-medium hidden sm:table-cell">role</th>
                </tr>
              </thead>
              <tbody>
                {CONTACTS.map((c, i) => {
                  const isSent     = sentRows.has(i);
                  const isSelected = selected === i;
                  const isSending  = sendState === 'sending' && isSelected && !isSent;
                  return (
                    <tr
                      key={i}
                      onClick={() => selectRow(i)}
                      className={`border-b border-gray-100 last:border-0 transition-colors duration-200 ${
                        sendState === 'idle' ? 'cursor-pointer' : 'cursor-default'
                      } ${
                        isSent     ? 'bg-green-50/60' :
                        isSending  ? 'bg-blue-50' :
                        isSelected ? 'bg-green-50' :
                                     'hover:bg-gray-50'
                      }`}
                    >
                      <td className="px-3 py-2.5 text-gray-700 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isSent ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          ) : isSending ? (
                            <Send className="w-3 h-3 text-blue-400 shrink-0 animate-pulse" />
                          ) : (
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isSelected ? 'bg-green-400' : 'bg-gray-200'}`} />
                          )}
                          <span className={isSent ? 'text-gray-400' : ''}>{c.name}</span>
                        </div>
                      </td>
                      <td className={`px-3 py-2.5 whitespace-nowrap ${isSent ? 'text-gray-300' : 'text-gray-500'}`}>{c.company}</td>
                      <td className={`px-3 py-2.5 hidden sm:table-cell whitespace-nowrap ${isSent ? 'text-gray-300' : 'text-gray-400'}`}>{c.role}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Send / Reset button */}
          <button
            onClick={sendState === 'done' ? handleReset : handleSend}
            disabled={sendState === 'sending'}
            className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
              sendState === 'done'
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : sendState === 'sending'
                ? 'bg-green-400 text-white cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-sm shadow-green-500/30 hover:shadow-green-500/40'
            }`}
          >
            {sendState === 'done' ? (
              <><RotateCcw className="w-3.5 h-3.5" /> {CONTACTS.length} sent — try again</>
            ) : sendState === 'sending' ? (
              <><Send className="w-3.5 h-3.5 animate-pulse" /> Sending {sentRows.size + 1} of {CONTACTS.length}…</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Send to {CONTACTS.length} recipients</>
            )}
          </button>
        </div>

        {/* ── Right: Live email preview ── */}
        <div className="p-5">
          <div
            style={{
              opacity:   previewVisible ? 1 : 0,
              transform: previewVisible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 0.18s ease, transform 0.18s ease',
            }}
            className="space-y-3 h-full flex flex-col"
          >
            {/* Preview header */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="w-3.5 h-3.5 text-green-500" />
              <span className="font-medium">Preview</span>
              <span className="text-gray-300">·</span>
              <span>Row {selected + 1} of {CONTACTS.length}</span>
            </div>

            {/* Rendered email card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3 flex-1">
              {/* Headers */}
              <div className="space-y-1.5 pb-3 border-b border-gray-100 text-xs">
                <div className="flex gap-2.5">
                  <span className="text-gray-400 w-12 shrink-0">To</span>
                  <span className="text-gray-600 font-medium">{contact.email}</span>
                </div>
                <div className="flex gap-2.5">
                  <span className="text-gray-400 w-12 shrink-0">Subject</span>
                  <span className="text-gray-700">
                    <TemplateSpans text={SUBJECT} contact={contact} resolve={true} />
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                <TemplateSpans text={BODY} contact={contact} resolve={true} />
              </div>
            </div>

            {/* Row indicator dots */}
            <div className="flex items-center justify-center gap-1.5">
              {CONTACTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => selectRow(i)}
                  aria-label={`Preview row ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    selected === i
                      ? 'w-5 h-2 bg-green-500'
                      : sentRows.has(i)
                      ? 'w-2 h-2 bg-green-300'
                      : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

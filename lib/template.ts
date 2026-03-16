const VAR_REGEX = /(?<![a-zA-Z])@([a-zA-Z_][a-zA-Z0-9_]*)/g;

export function interpolate(template: string, row: Record<string, string>): string {
  return template.replace(VAR_REGEX, (match, col) => {
    return col in row ? row[col] : match;
  });
}

export function extractVariables(template: string): string[] {
  const vars: string[] = [];
  let m: RegExpExecArray | null;
  const regex = new RegExp(VAR_REGEX.source, 'g');
  while ((m = regex.exec(template)) !== null) {
    if (!vars.includes(m[1])) vars.push(m[1]);
  }
  return vars;
}

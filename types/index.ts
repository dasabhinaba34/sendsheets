export interface User {
  email: string;
  name: string | null;
  picture: string | null;
}

export interface SheetData {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

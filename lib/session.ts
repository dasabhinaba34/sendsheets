import { SessionOptions } from 'iron-session';

export interface SessionData {
  userEmail?: string;
  userName?: string;
  userPicture?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'sendsheets_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

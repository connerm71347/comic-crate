export type ShelfEntry = {
  volumeId: string;
  title?: string;
  coverUrl?: string;
  publisher?: string;
  year?: string;
  addedAt?: string;
};

export type MockUser = {
  _id: string;
  username: string;
  email: string;
  password: string;
  bio: string;
  favoriteHero: string;
  favoriteComic: string;
  avatarKey: string;
  favorites: ShelfEntry[];
  readLater: ShelfEntry[];
  alreadyRead: ShelfEntry[];
  isVerified: boolean;
  isAdmin: boolean;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
};

export type MockComment = {
  _id: string;
  comicVolumeId: string;
  user: string;
  username: string;
  text: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
};

export const mockDb = {
  users: [] as MockUser[],
  comments: [] as MockComment[],
};

let idCounter = 0;

export function generateId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function resetMockDb() {
  mockDb.users.length = 0;
  mockDb.comments.length = 0;
  idCounter = 0;
}

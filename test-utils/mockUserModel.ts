import { generateId, mockDb, ShelfEntry } from "./mockDbState";

type Query = Record<string, any>;

function matchUser(user: any, query: Query) {
  return Object.entries(query).every(([key, value]) => {
    if (key.includes(".")) {
      const [root, child] = key.split(".");
      const collection = user[root];
      if (!Array.isArray(collection)) return false;
      return collection.some((entry) => entry[child] === value);
    }
    return user[key] === value;
  });
}

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function project(user: any, projection: string | undefined) {
  if (!user) return null;
  if (!projection) return clone(user);
  const fields = projection.split(/\s+/).filter(Boolean);
  const positives = fields.filter((f) => !f.startsWith("-"));
  if (positives.length > 0) {
    const result: Record<string, any> = {};
    positives.forEach((field) => {
      result[field] = user[field];
    });
    return result;
  }
  const copy = clone(user);
  fields.forEach((field) => {
    if (field.startsWith("-")) {
      delete copy[field.slice(1)];
    }
  });
  return copy;
}

function applyUpdate(user: any, update: any) {
  if (!user) return null;

  if (update.$addToSet) {
    for (const [key, value] of Object.entries(update.$addToSet)) {
      const list = user[key] as ShelfEntry[];
      if (!list.some((entry) => entry.volumeId === value.volumeId)) {
        list.push({
          ...value,
          addedAt: value.addedAt ?? new Date().toISOString(),
        });
      }
    }
  }

  if (update.$pull) {
    for (const [key, value] of Object.entries(update.$pull)) {
      const list = user[key] as ShelfEntry[];
      user[key] = list.filter(
        (entry) => entry.volumeId !== (value as ShelfEntry).volumeId
      );
    }
  }

  for (const [key, value] of Object.entries(update)) {
    if (key.startsWith("$")) continue;
    user[key] = value;
  }

  return user;
}

function selectable(user: any) {
  return {
    select: async (projection: string) => project(user, projection),
    lean: async () => (user ? clone(user) : null),
  };
}

class MockUserModel {
  private doc: any;

  constructor(doc: any) {
    this.doc = doc;
  }

  async save() {
    const saved = {
      _id: generateId("user"),
      favorites: [],
      readLater: [],
      alreadyRead: [],
      bio: "",
      favoriteHero: "",
      favoriteComic: "",
      avatarKey: "",
      isVerified: false,
      isAdmin: false,
      ...this.doc,
    };
    mockDb.users.push(saved);
    return clone(saved);
  }

  static async create(doc: any) {
    const instance = new MockUserModel(doc);
    return instance.save();
  }

  static findOne(query: Query) {
    const user = mockDb.users.find((u) => matchUser(u, query));
    const promise = Promise.resolve(user ? clone(user) : null);
    return Object.assign(promise, selectable(user));
  }

  static findById(id: string) {
    const user = mockDb.users.find((u) => u._id === id);
    const promise = Promise.resolve(user ? clone(user) : null);
    return Object.assign(promise, selectable(user));
  }

  static async findByIdAndUpdate(id: string, update: any, opts: any = {}) {
    const user = mockDb.users.find((u) => u._id === id);
    if (!user) return null;
    const updated = applyUpdate(user, update);
    return opts?.new ? clone(updated) : clone(user);
  }

  static async findByIdAndDelete(id: string) {
    const index = mockDb.users.findIndex((u) => u._id === id);
    if (index === -1) return null;
    const [removed] = mockDb.users.splice(index, 1);
    return clone(removed);
  }

  static async find(query: Query = {}) {
    const results = mockDb.users.filter((user) => matchUser(user, query));
    return results.map(clone);
  }
}

export default MockUserModel;

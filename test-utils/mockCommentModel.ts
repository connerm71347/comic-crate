import { generateId, mockDb } from "./mockDbState";

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function matchComment(comment: any, query: Record<string, any>) {
  return Object.entries(query).every(([key, value]) => comment[key] === value);
}

function makeQuery(results: any[]) {
  return {
    sort: ({ createdAt }: { createdAt: number }) => {
      const sorted = [...results].sort((a, b) =>
        createdAt === -1
          ? b.createdAt.localeCompare(a.createdAt)
          : a.createdAt.localeCompare(b.createdAt)
      );
      return {
        lean: async () => sorted.map(clone),
      };
    },
    lean: async () => results.map(clone),
  };
}

class MockCommentModel {
  static async create(doc: any) {
    const comment = {
      _id: generateId("comment"),
      likes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc,
    };
    mockDb.comments.push(comment);
    return clone(comment);
  }

  static find(query: Record<string, any>) {
    const results = mockDb.comments.filter((c) => matchComment(c, query));
    return makeQuery(results);
  }

  static async findById(id: string) {
    const comment = mockDb.comments.find((c) => c._id === id);
    if (!comment) return null;
    const hydrated = clone(comment);
    return Object.assign(hydrated, {
      save: async function save() {
        const index = mockDb.comments.findIndex((c) => c._id === id);
        if (index !== -1) {
          mockDb.comments[index] = {
            ...mockDb.comments[index],
            ...this,
            updatedAt: new Date().toISOString(),
          };
        }
        return clone(mockDb.comments[index]);
      },
    });
  }

  static async findByIdAndDelete(id: string) {
    const index = mockDb.comments.findIndex((c) => c._id === id);
    if (index === -1) return null;
    const [removed] = mockDb.comments.splice(index, 1);
    return clone(removed);
  }
}

export default MockCommentModel;

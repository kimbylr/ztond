import { Dexie, type EntityTable } from 'dexie';
import dexieCloud from 'dexie-cloud-addon';
import { useLiveQuery } from 'dexie-react-hooks';

export type TodoItem = {
  id: string;
  listId: string;
  content: string;
  url?: string;
  done?: boolean;
  position: number;
};

export type TodoList = {
  id: string;
  title: string;
  updatedAt: number; // timestamp
  todoCount: number;
  archived?: boolean;
};

const dexie = new Dexie('ztondDB', { addons: [dexieCloud] }) as Dexie & {
  lists: EntityTable<TodoList, 'id'>;
  items: EntityTable<TodoItem, 'id'>;
};

dexie.version(1).stores({
  lists: '@id, updatedAt',
  items: '@id, listId',
});

dexie.cloud.configure({
  databaseUrl: process.env.NEXT_PUBLIC_DEXIE_URL ?? '',
  requireAuth: true,
});

/** todo lists */

export const useLists = () =>
  useLiveQuery(() =>
    dexie.lists.filter(({ archived }) => !archived).sortBy('updatedAt')
  )?.toReversed() ?? [];

export const getLastUpdatedList = () =>
  dexie.lists
    .orderBy('updatedAt')
    .filter(({ archived }) => !archived)
    .reverse()
    .first();

export const addList = async (title: string) =>
  dexie.lists.add({ title, updatedAt: Date.now().valueOf(), todoCount: 0 });

export const updateList = (listId: string, obj: Partial<TodoList>) =>
  dexie.lists.update(listId, obj);

const updateListTodoCount = async (listId: string) => {
  const todoCount = (await dexie.items.where({ listId }).toArray()).filter(
    ({ content, done }) => !content.startsWith('---') && !done
  ).length;
  updateList(listId, { todoCount, updatedAt: Date.now().valueOf() });
};

const updateListDateNow = async ({ id, type }: { id: string; type: 'listId' | 'itemId' }) => {
  const listId = type === 'listId' ? id : (await dexie.items.get(id))?.listId;
  if (listId) updateList(listId, { updatedAt: Date.now().valueOf() });
};

export const archiveList = (listId: string) => updateList(listId, { archived: true });

/** todo items */

export const useTodos = (listId: string | null) =>
  useLiveQuery<TodoItem[] | null | ''>(
    () => listId && dexie.items.where({ listId }).sortBy('position'),
    [listId]
  ) || null;

export const addTodo = async (
  args: { listId: string; content: string; url?: string },
  prepend?: boolean
) => {
  const items = await dexie.items.where({ listId: args.listId }).sortBy('position');
  const position = prepend ? (items.at(0)?.position ?? 0) - 1 : (items.at(-1)?.position ?? 0) + 1;
  dexie.items.add({ ...args, position });
  updateListTodoCount(args.listId);
};

type EditTodoArgs = { id: string; content?: string; url?: string; done?: boolean };
export const editTodo = async ({ id, content, url, done }: EditTodoArgs) => {
  dexie.items.update(id, { content, url, done });
  updateListDateNow({ id, type: 'itemId' });
};

export const editTodoPositions = async (changes: { id: string; position: number }[]) => {
  dexie.items.bulkUpdate(changes.map(({ id, position }) => ({ key: id, changes: { position } })));
  if (changes[0]) updateListDateNow({ id: changes[0].id, type: 'itemId' });
};

export const triggerTodoDone = async ({ listId, todoId }: { listId: string; todoId: string }) => {
  const todo = await dexie.items.get(todoId);
  dexie.items.update(todoId, { done: !todo?.done });
  updateListTodoCount(listId);
};

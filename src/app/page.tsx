'use client';

import {
  addTodo,
  editTodo,
  editTodoPositions,
  getLastUpdatedList,
  useTodos,
} from '@/services/dexie';
import { classNames } from '@/utils/class-names';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { FC, useEffect, useState } from 'react';
import { CreateTodo } from './components/create-todo';
import { Header } from './components/header';
import { DROPPABLE_ID_ACTIVE_LIST, Items } from './components/items';
import { Lists } from './components/lists';
import { Switch } from './components/switch';
import { ListContext, useListContext } from './context';

const Page = () => {
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [displayDone, setDisplayDone] = useState(false);
  const [prepend, setPrepend] = useState(true);

  useEffect(() => {
    if (activeListId === null) {
      getLastUpdatedList().then((list) => list && setActiveListId(list.id));
    }
  }, [activeListId]);

  return (
    <>
      <Header />
      <ListContext.Provider value={{ activeListId, setActiveListId, displayDone }}>
        <main
          className="bg-white"
          /** header 80 + 16 + 16|notch */
          style={{ minHeight: 'calc(100vh - 96px - max(env(safe-area-inset-top), 16px))' }}
        >
          <CreateTodo prepend={prepend} setPrepend={setPrepend} />

          <DragArea prepend={prepend} />

          <div className="px-6 pt-8 pb-12 flex items-center gap-2.5">
            <Switch active={displayDone} toggleActive={() => setDisplayDone((d) => !d)} />
            <span className={classNames(displayDone ? 'text-primary' : 'text-gray-500')}>
              Erledigte anzeigen
            </span>
          </div>
        </main>
      </ListContext.Provider>
    </>
  );
};

const DragArea: FC<{ prepend: boolean }> = ({ prepend }) => {
  const { activeListId, displayDone } = useListContext();
  const todos = useTodos(activeListId);

  const reorderInList = (itemId: string, index: number) => {
    if (!todos) return;

    const itemIds = todos.map(({ id }) => id) ?? [];
    const oldIndex = itemIds.indexOf(itemId);
    const newIndex = displayDone
      ? index
      : itemIds.indexOf(todos.filter(({ done }) => !done).map(({ id }) => id)[index]);

    if (oldIndex === newIndex) return;

    const offset = todos.at(0)?.position ?? 0;
    const itemsBetween =
      oldIndex < newIndex // moving down
        ? itemIds
            .slice(oldIndex + 1, newIndex + 1)
            .map((id, i) => ({ id, position: offset + i + oldIndex }))
        : itemIds
            .slice(newIndex, oldIndex)
            .map((id, i) => ({ id, position: offset + i + newIndex + 1 }));

    editTodoPositions([{ id: itemId, position: newIndex + offset }, ...itemsBetween]);
  };

  const dragToOtherList = async (todoId: string, newListId: string) => {
    const todo = todos?.find(({ id }) => id === todoId);
    if (!todo) return;

    const { content, url, listId, id } = todo;
    await editTodo({ id, listId, done: true, content: `*verschoben* ${todo.content}` });
    addTodo({ content, url, listId: newListId }, prepend, true);
  };

  const onDragEnd: OnDragEndResponder = ({ draggableId: itemId, destination }) => {
    if (!destination) return;
    const { droppableId, index } = destination;

    if (droppableId === DROPPABLE_ID_ACTIVE_LIST) {
      reorderInList(itemId, index);
    } else {
      const list = droppableId.startsWith('other-list-') && droppableId.replace('other-list-', '');
      if (list) dragToOtherList(itemId, list);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Lists />
      <Items todos={todos} />
    </DragDropContext>
  );
};

export default Page;

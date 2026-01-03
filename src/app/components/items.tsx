import { editTodo, TodoItem, triggerTodoDone } from '@/services/dexie';
import { classNames } from '@/utils/class-names';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { FC, useEffect, useRef, useState } from 'react';
import { useListContext } from '../context';
import { IconCheckCircle } from '../icons/check-circle';
import { IconDragGrip } from '../icons/drag-grip';
import { IconEdit } from '../icons/edit';
import { IconLink } from '../icons/link';
import { TextFieldOverlay } from './overlay';

export const DROPPABLE_ID_ACTIVE_LIST = 'active-list';

export const Items: FC<{ todos: TodoItem[] | null }> = ({ todos }) => {
  const { displayDone } = useListContext();

  if (!todos) {
    return null;
  }

  if (!todos.length) {
    return (
      <div className="mb-8 mt-5 select-none flex justify-center">
        <IconCheckCircle className="size-48 text-gray-100" />
      </div>
    );
  }

  return (
    <Droppable droppableId={DROPPABLE_ID_ACTIVE_LIST}>
      {(provided) => (
        <ul
          className="select-none overflow-hidden flex flex-col items-end"
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          {(displayDone ? todos : todos.filter(({ done }) => !done)).map((todo, i) => (
            <Item key={todo.id} todo={todo} index={i} />
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
};

const Item: FC<{ todo: TodoItem; index: number }> = ({ todo, index }) => {
  const { activeListId } = useListContext();
  // const { attributes, listeners, setNodeRef, isDragging, ...dnd } = useSortable({ id: todo.id });
  // const isDraggingDebounced = useDebounce(() => isDragging, 300);

  // const dragGripProps = { ref: setNodeRef, ...attributes, ...listeners };
  const onSetDone = (todoId: string) => triggerTodoDone({ listId: activeListId!, todoId });
  const Element = todo.content.startsWith('---') ? DividerItem : ContentItem;
  const [minHeight, setHeight] = useState(0);

  return (
    <Draggable draggableId={todo.id} index={index}>
      {(provided, { isDragging }) => (
        <li
          className="size-10 relative mb-0.75"
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{ ...provided.draggableProps.style, minHeight }}
          id={todo.id}
        >
          <div
            className={classNames(
              'absolute right-0 w-screen flex',
              isDragging && 'shadow-[0_0_12px_#6669] '
            )}
            style={{ minHeight }}
          >
            <Element
              todo={todo}
              onSetDone={onSetDone}
              dragGripProps={provided.dragHandleProps}
              setHeight={setHeight}
            />
          </div>
        </li>
      )}
    </Draggable>
  );
};

type ItemProps = {
  todo: TodoItem;
  dragGripProps: object | null;
  onSetDone: (id: string) => void;
  setHeight: (px: number) => void;
};

const DividerItem: FC<ItemProps> = ({ todo, dragGripProps, onSetDone }) => {
  const grabButton = (
    <span
      {...dragGripProps}
      className="cursor-grab absolute right-3 top-0 bottom-0 flex items-center"
    >
      <IconDragGrip className="size-5 text-gray-200 rotate-90" />
    </span>
  );

  if (todo.content === '---') {
    return (
      <button
        onClick={() => onSetDone(todo.id)}
        className="relative w-full h-10 scale-y-100! bg-white flex items-center"
      >
        <hr className="w-1/2 mx-auto border-t-2 border-dashed border-gray-500" />
        {grabButton}
      </button>
    );
  }

  return (
    <button
      onClick={() => onSetDone(todo.id)}
      className="relative min-h-10 flex w-full justify-center items-center gap-4 bg-white"
    >
      <span className="w-[9%] border-b-2 border-dashed border-gray-500" />
      <span className="text-gray-600 text-lg">{todo.content.substring(3).trim()}</span>
      <span className="w-[9%] border-b-2 border-dashed border-gray-500" />
      {grabButton}
    </button>
  );
};

const ContentItem: FC<ItemProps> = ({ todo, dragGripProps, onSetDone, setHeight }) => {
  const { content: initialContent, url: initialUrl, id, listId } = todo;
  const [content, setContent] = useState(todo.content);
  const [editLink, setEditLink] = useState(false);
  const [url, setUrl] = useState(initialUrl || '');

  const [editing, setEditing] = useState(false);
  const onEdit = () => {
    if (content.trim() || url !== initialUrl) {
      editTodo({ listId, id, content, url });
    }
    setEditing(false);
  };

  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (ref.current && ref.current.offsetHeight > 40) setHeight(ref.current.offsetHeight + 10);
  }, [setHeight]);

  return (
    <span
      className={classNames(
        'flex gap-2.5 grow min-h-10 pl-6 pr-3 bg-gray-100 items-center justify-between text-lg',
        todo.done ? 'line-through text-gray-300' : 'text-gray-900'
      )}
    >
      {editing ? (
        <form onSubmit={onEdit} className="grow">
          <input
            type="text"
            id="edit-content"
            className="text-primary outline-hidden grow bg-transparent selection:bg-gray-200 w-full appearance-none"
            placeholder={initialContent}
            value={content}
            onChange={({ currentTarget: { value } }) => setContent(value)}
            autoFocus
            onBlur={(e) => e.relatedTarget?.id !== 'edit-url-button' && setEditing(false)}
            onFocus={(e) => e.currentTarget.select()}
            autoCapitalize="none"
          />
        </form>
      ) : (
        <button
          className="overflow-hidden text-ellipsis cursor-pointer grow text-left leading-snug"
          onClick={() => onSetDone(id)}
          ref={ref}
        >
          {content}
        </button>
      )}

      {initialUrl && !editing && (
        <a href={initialUrl} target="_blank" className="text-gray-500">
          <IconLink className="size-6 p-1.5 -m-1.5 text-primary hover:text-gray-700" />
        </a>
      )}

      <button onClick={() => (editing ? onEdit() : setEditing(true))}>
        <IconEdit
          className={classNames(
            'size-6 p-1.5 -m-1.5',
            editing ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
          )}
        />
      </button>

      {!editing ? (
        <button {...dragGripProps} className="cursor-grab">
          <IconDragGrip className="size-5 text-gray-200 rotate-90" />
        </button>
      ) : (
        // tabindex is needed to be recognised as relatedTarget by Safari
        <button onClick={() => setEditLink(true)} id="edit-url-button" tabIndex={0}>
          <IconLink
            className={classNames(
              'size-6 p-1.5 -m-0.5',
              url ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            )}
          />
        </button>
      )}

      {editLink && (
        <TextFieldOverlay
          onClose={() => setEditLink(false)}
          onSubmit={async (editedUrl) => {
            setUrl(editedUrl ?? '');
            setEditLink(false);
            document.getElementById('edit-content')?.focus?.();
          }}
          input={{ name: 'url', placeholder: url || 'https://…', defaultValue: url }}
        />
      )}
    </span>
  );
};

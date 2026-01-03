import { addList, archiveList, TodoList, updateList, useLists } from '@/services/dexie';
import { classNames } from '@/utils/class-names';
import { FC, useState } from 'react';
import { useListContext } from '../context';
import { IconAdd } from '../icons/add';
import { IconDelete } from '../icons/delete';
import { IconEdit } from '../icons/edit';
import { TextFieldOverlay } from './overlay';
import { Droppable } from '@hello-pangea/dnd';

export const Lists: FC = () => {
  const lists = useLists();

  const [editMode, setEditMode] = useState(false);
  const [showAddList, setShowAddList] = useState(false);
  const [showEditList, setShowEditList] = useState<TodoList | null>(null);

  return (
    <div className="p-6">
      <div className="float-right flex gap-2 ml-4">
        <button onClick={() => setShowAddList(true)}>
          <IconAdd className="size-7 -m-1 p-1 text-gray-500 hover:text-gray-700" />
        </button>
        <button onClick={() => setEditMode((e) => !e)}>
          <IconEdit
            className={classNames(
              'size-7 -m-1 p-1  hover:text-gray-700',
              editMode ? 'text-primary' : 'text-gray-500'
            )}
          />
        </button>
      </div>

      <ul className={classNames(editMode && 'flex flex-col')}>
        {lists.map((list) => (
          <List
            list={list}
            key={list.id}
            editMode={editMode}
            setEditMode={setEditMode}
            setShowEditList={setShowEditList}
          />
        ))}
      </ul>

      {showAddList && (
        <ListNameOverlay
          onClose={(quitMode) => {
            setShowAddList(false);
            if (quitMode) setEditMode(false);
          }}
        />
      )}
      {showEditList && (
        <ListNameOverlay
          onClose={(quitMode) => {
            setShowEditList(null);
            if (quitMode) setEditMode(false);
          }}
          list={showEditList}
        />
      )}
    </div>
  );
};

const List: FC<{
  list: TodoList;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  setShowEditList: (list: TodoList | null) => void;
}> = ({ list, editMode, setEditMode, setShowEditList }) => {
  const { activeListId, setActiveListId } = useListContext();

  return (
    <Droppable droppableId={`other-list-${list.id}`}>
      {(provided, { isDraggingOver }) => (
        <li
          className="inline-flex gap-2 mr-2.5 mb-2.5"
          {...provided.droppableProps}
          ref={provided.innerRef}
        >
          <button
            onClick={() => setActiveListId(list.id)}
            className={classNames(
              'py-1 px-2 flex items-center gap-2 border',
              activeListId === list.id
                ? 'text-gray-50 bg-primary border-primary'
                : 'text-primary bg-gray-50 border-gray-300',
              isDraggingOver && 'border-highlight! outline-1 outline-solid outline-highlight'
            )}
          >
            {list.title}
            <hr className="border-l border-current h-5" />
            <span className="text-sm">{list.todoCount}</span>
          </button>
          {editMode && (
            <>
              <button
                onClick={() => {
                  if (confirm(`Liste ${list.title} wirklich löschen?`)) {
                    archiveList(list.id);
                    setActiveListId(null);
                    setEditMode(false);
                  }
                }}
              >
                <IconDelete className="size-5 text-gray-500 hover:text-gray-700" />
              </button>
              <button className="text-primary" onClick={() => setShowEditList(list)}>
                <IconEdit className="size-4 text-gray-500 hover:text-gray-700" />
              </button>
            </>
          )}
        </li>
      )}
    </Droppable>
  );
};

const ListNameOverlay: FC<{ onClose: (quitMode?: boolean) => void; list?: TodoList }> = ({
  onClose,
  list,
}) => {
  const { setActiveListId } = useListContext();

  return (
    <TextFieldOverlay
      onClose={onClose}
      onSubmit={async (title) => {
        if (!title) {
          return;
        }

        if (list) {
          updateList(list.id, { title, updatedAt: Date.now().valueOf() });
        } else {
          setActiveListId(await addList(title));
        }
        onClose(true);
      }}
      input={{ name: 'list-name', placeholder: 'Add list', defaultValue: list?.title }}
    />
  );
};

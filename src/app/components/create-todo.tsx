import { addTodo } from '@/services/dexie';
import { classNames } from '@/utils/class-names';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { useListContext } from '../context';
import { IconLink } from '../icons/link';
import { TextFieldOverlay } from './overlay';

type Props = {
  prepend: boolean;
  setPrepend: Dispatch<SetStateAction<boolean>>;
};

export const CreateTodo: FC<Props> = ({ prepend, setPrepend }) => {
  const { activeListId } = useListContext();

  const [content, setContent] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [url, setUrl] = useState('');

  return (
    <div className="px-6 py-8 bg-primary-100 flex items-center gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (content && activeListId) {
            addTodo({ listId: activeListId, content, url: url || undefined }, prepend);
            setContent('');
            setUrl('');
          }
        }}
        className="grow relative"
      >
        <input
          type="text"
          placeholder="ztond"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="outline-none w-full h-10 text-xl pr-10 px-2 border border-gray-300 font-normal text-gray-900 appearance-none rounded-none placeholder:text-gray-300"
        />
        <button
          type="button"
          onClick={() => setShowLink(true)}
          title={url}
          className={classNames(
            'absolute p-2 hover:text-gray-900 right-1.5 inset-y-1 cursor-pointer',
            url ? 'text-primary' : 'text-gray-500'
          )}
        >
          <IconLink className="size-4" />
        </button>
      </form>

      <PrependButton onClick={() => setPrepend((p) => !p)} prepend={prepend} />

      {showLink && (
        <TextFieldOverlay
          onClose={() => setShowLink(false)}
          onSubmit={async (newUrl) => {
            setUrl(newUrl ?? '');
            setShowLink(false);
          }}
          input={{ name: 'url', placeholder: url || 'https://…' }}
        />
      )}
    </div>
  );
};

const PrependButton: FC<{ prepend: boolean; onClick: () => void }> = ({ prepend, onClick }) => (
  <button type="button" onClick={onClick} className="w-5 shrink-0 flex gap-1 flex-col">
    <span className={classNames('w-full h-[3px]', prepend ? 'bg-primary' : 'bg-white')} />
    <span className="w-full h-[3px] bg-white" />
    <span className={classNames('w-full h-[3px]', prepend ? 'bg-white' : 'bg-primary')} />
  </button>
);

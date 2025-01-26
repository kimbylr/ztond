'use client';

import { FC, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onCancel: () => void;
};

export const Overlay: FC<Props> = ({ children, onCancel }) => (
  <>
    <div className="fixed inset-0 bg-black/75 z-10 cursor-pointer" />
    <div onClick={onCancel} className="fixed inset-0 z-20 flex justify-center items-center">
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  </>
);

export const TextFieldOverlay: FC<{
  onClose: () => void;
  onSubmit: (content: string | null) => void;
  input: { name: string; placeholder: string; defaultValue?: string };
}> = ({ onClose, onSubmit, input }) => (
  <Overlay onCancel={onClose}>
    <form
      className="bg-primary p-5 shadow-[0_0_40px_#222]"
      onSubmit={async (e) => {
        e.preventDefault();
        const content = new FormData(e.currentTarget).get(input.name);
        onSubmit(content && typeof content === 'string' ? content : null);
      }}
    >
      <input
        name={input.name}
        type="text"
        className="border-white border-b appearance-none placeholder:text-white/25 max-w-[80vw] text-xl px-0.5 py-1 text-white bg-[transparent] outline-none selection:bg-white/30"
        placeholder={input.placeholder}
        autoFocus
        onFocus={(e) => e.currentTarget.select()}
        defaultValue={input.defaultValue}
      />
    </form>
  </Overlay>
);

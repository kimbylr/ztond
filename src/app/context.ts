import { createContext, useContext } from 'react';

export const ListContext = createContext<{
  activeListId: string | null;
  setActiveListId: (id: string | null) => void;
  displayDone: boolean;
}>({
  activeListId: null,
  setActiveListId: () => {},
  displayDone: false,
});

export const useListContext = () => useContext(ListContext);

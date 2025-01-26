import { useEffect, useState } from 'react';
import { fetchAllTodos } from '../store/actions/contexts';
import { getLastEdit } from './getLastEdit';

export const useRefreshOnFocus = (passphrase, dispatch) => {
  const [lastEdit, setLastEdit] = useState(0);

  useEffect(() => {
    if (!passphrase) {
      return;
    }

    // if window gets focus –> check for changes
    const poll = async () => {
      const timestamp = Date.parse(await getLastEdit(passphrase));

      // first time: just set the timestamp
      if (timestamp && !lastEdit) {
        return setLastEdit(timestamp);
      }

      // refresh
      if (timestamp > lastEdit) {
        dispatch(fetchAllTodos());
        setLastEdit(timestamp);
      }
    };

    window.addEventListener('focus', poll);
    return () => window.removeEventListener('focus', poll);
  }, [passphrase, dispatch, lastEdit]);
};

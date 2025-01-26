import { classNames } from '@/utils/class-names';
import { FC } from 'react';

type Props = {
  active: boolean;
  toggleActive: () => void;
};

export const Switch: FC<Props> = ({ active, toggleActive }) => (
  <button
    onClick={toggleActive}
    className={classNames(
      'relative w-10 h-6 rounded-full transition-colors duration-200',
      active ? 'bg-primary' : 'bg-gray-300'
    )}
  >
    <div
      className={classNames(
        'absolute top-[3px] left-[3px] size-[18px] bg-white rounded-full shadow transition-transform duration-200',
        active ? 'translate-x-4' : 'translate-x-0'
      )}
    />
  </button>
);

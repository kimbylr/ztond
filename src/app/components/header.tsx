export const Header = () => (
  <header
    className="h-28 p-1 bg-primary flex items-center justify-center"
    style={{ padding: 'max(env(safe-area-inset-top), 16px) 0 16px' }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/logo.png" alt="ztond" onClick={reload} className="h-full p-1" />
  </header>
);

const reload = () => window.location.reload();

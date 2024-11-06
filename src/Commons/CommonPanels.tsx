import { Header } from "./Header";
import { Logo } from "./Logo";

export const CommonPanels = ({ main, side }: { main: JSX.Element, side: JSX.Element }): JSX.Element => {
  // TODO: More elegant crossing border implementation
  return (
    <div
      className='grid grid-cols-[300px_1px_1fr] grid-rows-[100px_1px_1fr] h-screen w-screen'
    >
      <div
        className='content-center pl-6'
      >
        <Logo />
      </div>
      <div
        className='bg-gradient-to-b from-10% from-base-100 to-base-content w-px'
      />
      <div
        className='content-center px-6 w-full'
      >
        <Header />
      </div>
      <div
        className='bg-gradient-to-r from-10% from-base-100 h-px to-base-content'
      />
      <div
        className='bg-base-content h-px w-px'
      />
      <div
        className='bg-gradient-to-r from-base-content h-px to-90% to-base-100'
      />
      <div
        className='overflow-y-scroll p-4'
      >
        {side}
      </div>
      <div
        className='bg-gradient-to-b from-base-content to-90% to-base-100 w-px'
      />
      <div
        className='h-full overflow-y-scroll p-4 w-full'
      >
        {main}
      </div>
    </div>
  );
};
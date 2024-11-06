import { Link } from "react-router-dom";

export const Logo = (): JSX.Element => {
  return (
    <Link to='/'>
      <div
        className='flex font-bold gap-2 items-center'
      >
        <span
          className='text-center text-lg w-full'
        >
          AI Media Studio
        </span>
      </div>
    </Link>
  );
};

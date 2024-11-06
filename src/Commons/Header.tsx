import classnames from "classnames";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  GalleryIcon,
  NodeEditorIcon,
} from "./Icons";

export const Header = (): JSX.Element => {
  const location = useLocation();
  const atHome = location.pathname === '/';
  const atMyContents = location.pathname === '/my_contents';
  const atNodeEditor = location.pathname === '/node';

  return (
    <ul
      className='flex flex-row menu'
    >
      <li>
        <Link
          className={classnames(
            'flex gap-2 items-center',
            atHome ? 'active' : '',
          )}
          to='/'
        >
          <HomeIcon />
          Home
        </Link>
      </li>
      <li>
        <Link
          className={classnames(
            'flex gap-2 items-center',
            atMyContents ? 'active' : '',
          )}
          to='/my_contents'
        >
          <GalleryIcon />
          Gallery
        </Link>
      </li>
      <li>
        <Link
          className={classnames(
            'flex gap-2 items-center',
            atNodeEditor ? 'active' : '',
          )}
          to='/node'
        >
          <NodeEditorIcon />
          Node Editor
        </Link>
      </li>
      <li className='ml-auto'>
        <Link
          to='/logout'
        >
          Logout
        </Link>
      </li>
    </ul>
  );
};

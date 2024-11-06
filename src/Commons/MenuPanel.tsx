import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { atom, useRecoilState } from "recoil";
import {
  EditToolIcon,
  FinishingUpIcon,
  HomeIcon,
  ImageGenerationIcon,
  GalleryIcon,
  Generation3DIcon,
  NodeEditorIcon,
  VideoGenerationIcon,
} from "./Icons";
import { type ToolCategory, Tools } from "../Tools/Tool";

type SubMenuOpenStateType = Record<string, boolean>;
const subMenuOpenState = atom<SubMenuOpenStateType>({
  key: 'subMenuOpenState',
  default: {},
});

const ToolList = ({ category }: { category: ToolCategory }): JSX.Element => {
  return (
    <ul>
      {
        Tools
        .filter(tool => tool.category === category)
        .map(tool => {
          return (
            <li
              key={tool.name}
            >
              <Link
                to={tool.path}
              >
                {tool.displayName || tool.name}
              </Link>
            </li>
          );
        })
      }
    </ul>
  );
};

const SubMenu = ({
  category,
  icon,
  label,
}: {
  category: ToolCategory,
  icon: JSX.Element,
  label: string,
}): JSX.Element => {
  const [openState, setOpenState] = useRecoilState(subMenuOpenState);
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    // Throw if current is unset? Can it happen?
    const detailsEl = ref.current!;
    const onToggle = () => {
      setOpenState((prev) => {
        return {
          ...prev,
          [label]: detailsEl.open,
        };
      });
    };
    detailsEl.addEventListener('toggle', onToggle);
    return () => {
      detailsEl.removeEventListener('toggle', onToggle);
    };
  }, [])

  return (
    <details
      open={!!openState[label]}
      ref={ref}
    >
      <summary>
        {icon}
        {label}
      </summary>
      <ToolList
        category={category}
      />
    </details>
  );
}

export const MenuPanel = (): JSX.Element => {
  const location = useLocation();

  // TODO: Can we do these more elegantly and maintainably?
  const atHome = location.pathname === '/';
  const atMyContents = location.pathname === '/my_contents';
  const atNodeEditor = location.pathname === '/node';

  return (
    <ul className='menu'>
      <li
        key='Home'
      >
        <Link
          className={atHome ? 'active' : ''}
          to='/'
        >
          <HomeIcon />
          Home
        </Link>
      </li>
      <li
        key='Gallery'
      >
        <Link
          className={atMyContents ? 'active' : ''}
          to='/my_contents'
        >
          <GalleryIcon />
          Gallery
        </Link>
      </li>
      <li
        key='Image Generation'
      >
        <SubMenu
          category='Image Generation'
          icon={(<ImageGenerationIcon />)}
          label='Image Generation'
        />
      </li>
      <li
        key='Edit'
      >
        <SubMenu
          category='Image Edit'
          icon={(<EditToolIcon />)}
          label='Edit'
        />
      </li>
      <li
        key='Finishing up'
      >
        <SubMenu
          category='Image Finishing Up'
          icon={(<FinishingUpIcon />)}
          label='Finishing Up'
        />
      </li>
      <li
        key='Video'
      >
        <SubMenu
          category='Video Generation'
          icon={(<VideoGenerationIcon />)}
          label='Video'
        />
      </li>
      <li
        key='3D'
      >
        <SubMenu
          category='3D Model Generation'
          icon={(<Generation3DIcon />)}
          label='3D'
        />
      </li>
      <li
        key='Node Editor'
      >
        <Link
          className={atNodeEditor ? 'active' : ''}
          to='/node'
        >
          <NodeEditorIcon />
          Node Editor
        </Link>
      </li>
    </ul>
  );
};

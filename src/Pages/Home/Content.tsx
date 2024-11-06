import { Link, useNavigate } from "react-router-dom";
import { DrawIcon, ToolIcon } from "../../Commons/Icons";
import { type ToolCategory, Tools } from "../../Tools/Tool";
import { useRequest } from "../../Use/useRequest";
import { selectLocalFile } from "../../Utils/utils";

const ToolList = ({
  category,
  icon,
  label,
}: {
  category: ToolCategory,
  icon: JSX.Element,
  label: string,
} ): JSX.Element => {
  const { uploadImage } = useRequest();
  const navigate = useNavigate();

  return (
    <>
      <div
        className='flex gap-2 items-end'
      >
        {icon}
        {label}
      </div>
      <div
        className='gap-2 grid grid-cols-[repeat(auto-fill,13rem)]'
      >
        {
          Tools
            .filter(tool => !!tool.featured)
            .filter(tool => tool.category === category)
            .map((tool, index) => (
              <Link
                key={index}
                onClick={async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                  if (!tool.ui.some(uiDef => uiDef.type === 'image')) {
                    return;
                  }

                  e.preventDefault();
                  // TODO: Error handling
                  const file = await selectLocalFile('images/*');
                  const image = await uploadImage(file);
                  navigate(`${tool.path}/${image.uuid}`);
                }}
                to={tool.path}
              >
                <div
                  className='bg-primary card card-compact h-52 text-primary-content w-52'
                >
                  <figure
                    className='bg-secondary h-40'
                  >
                    <img
                      className='h-full object-cover w-full'
                      src={tool.featured!.menuImage}
                    />
                  </figure>
                  <div
                    className='card-body h-12'
                  >
                    <div
                      className='card-title justify-center text-sm'
                    >
                      {tool.displayName || tool.name}
                    </div>
                  </div>
                </div>
              </Link>
            ))
        }
      </div>
    </>
  );
}

export const Content = (): JSX.Element => {
  return (
    <div
      className='gap-4 grid max-h-full w-full'
    >
      <ToolList
        category='Image Generation'
        icon={(<DrawIcon />)}
        label='Featured Generation tools shortcut'
      />
      <ToolList
        category='Image Edit'
        icon={(<ToolIcon />)}
        label='Featured Editing tools shortcut'
      />
    </div>
  );
};

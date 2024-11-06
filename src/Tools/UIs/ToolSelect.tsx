import { useNavigate } from "react-router-dom";
import { Tools } from "../Tool";

export const ToolSelect = ({
  imageUuid,
  selectedTool,
}: {
  imageUuid?: string,
  selectedTool?: string,
}): JSX.Element => {
  const navigate = useNavigate();
  // TODO: Optimize if needed
  const defaultValue = Tools.find(tool => tool.name === selectedTool)?.path;

  return (
    <select
      className='select select-bordered select-sm w-full'
      defaultValue={defaultValue}
      onChange={(e) => {
        navigate(e.target.selectedOptions[0].value + (imageUuid ? '/' + imageUuid : ''));
      }}
    >
      {
        [
          {
            displayName: 'Info',
            name: 'Info',
            path: '/my_content',
          },
          Tools.filter(tool => tool.ui.some(uiDef => uiDef.type === 'image')),
        ].flat().map((params, index) => {
          return (
            <option
              key={index}
              value={params.path}
            >
              {params.displayName || params.name}
            </option>
          );
        })
      }
    </select>
  );
};

import { Content } from "./Content";
import { CommonPanels } from "../../Commons/CommonPanels";
import { MenuPanel } from "../../Commons/MenuPanel";

export const Gallery = (): JSX.Element => {
  return (
    <CommonPanels
      main={<Content />}
      side={<MenuPanel />}
    />
  );
};

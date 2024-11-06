import { CommonPanels } from "../../Commons/CommonPanels";
import { MenuPanel } from "../../Commons/MenuPanel";
import { Content } from "./Content";

export const Home = (): JSX.Element => {
  return (
    <CommonPanels
      main={<Content />}
      side={<MenuPanel />}
    >
    </CommonPanels>
  );
};
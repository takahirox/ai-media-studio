import { useState } from "react";
import { useParams } from "react-router-dom";
//import '@google/model-viewer';
import { Sidebar } from "./Sidebar";
import { CommonPanels } from "../../Commons/CommonPanels";
import { ContentViewer } from "../../Commons/ContentViewer";

export const MyContent = (): JSX.Element => {
  const { uuid } = useParams();
  const [imageUuid, setImageUuid] = useState(uuid || '');

  return (
    <CommonPanels
      main={(
        <ContentViewer
          imageUuid={imageUuid}
          onChange={(uuid: string) => {
            setImageUuid(uuid);
          }}
        />
        /*
        // TODO: Support 3D
        {image?.src && query.tool === 'Image to 3D' && (
          <model-viewer
            ar
            camera-controls
            max-camera-orbit="auto auto 300%"
            orientation="0 0 180deg"
            src={image.src}
            style={{
              aspectRatio: '1',
              height: 'auto',
              width: '100%',
            }}
          />
        )}
        */
      )}
      side={(
        <Sidebar
          imageUuid={imageUuid}
          onImageClick={(uuid: string) => {
            setImageUuid(uuid);
          }}
        />
      )}
    />
  );
}
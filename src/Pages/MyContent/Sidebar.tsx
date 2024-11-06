import classnames from "classnames";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ActionIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  AspectRatioIcon,
  ClockIcon,
  DownloadIcon,
  ImageIcon,
  PromptIcon,
  RetryIcon,
  SeedIcon,
  ToolIcon,
  VariationIcon,
} from "../../Commons/Icons";
import { MediaComponent } from "../../Commons/MediaComponent";
import { ToolMap, Tools } from "../../Tools/Tool";
import { ToolSelect } from "../../Tools/UIs/ToolSelect";
import { useImage } from "../../Use/useImage";;
import { useQuery } from "../../Use/useQuery";
import { toDateTimeString } from "../../Utils/utils";

const LinkIfNeeded = (
  {
    children,
    to,
  }: {
    children: ReactNode,
    to: string,
  }
): JSX.Element => {
  return (
    <>
      {to ? (
        <Link to={to}>
          {children}
        </Link>
      ) : (
        <>
          {children}
        </>
      )}
    </>
  );
};

const getToolLink = (toolName: string, queryUuid: string, imageUuid: string): string => {
  const path = ToolMap[toolName]?.path;
  return path
    ? `${path}?image=${imageUuid}#${queryUuid}`
    : ''; // TODO: Throw an error?
};

export const Sidebar = ({
  imageUuid,
  onImageClick,
}: {
  imageUuid?: string,
  onImageClick: (uuid: string) => void,
}): JSX.Element => {
  const { findImageByUuid } = useImage();
  const { findQueryByUuid } = useQuery();
  const image = imageUuid ? findImageByUuid(imageUuid) : null;
  const query = image ? findQueryByUuid(image.query) : null;

  return (
    <div
      className='flex flex-col gap-8'
    >
      <div
        className='flex justify-between'
      >
        <div
          className='flex gap-2 items-center'
        >
          <ImageIcon />
          <ToolSelect
            imageUuid={imageUuid}
            selectedTool='Info'
          />
        </div>
      </div>
      {image && query && (
        <div
          className='flex flex-col gap-2'
        >
          <LinkIfNeeded
            to={getToolLink(query.tool, query.uuid, image.uuid)}
          >
            <div
              className='flex gap-2 items-end'
            >
              <ToolIcon />
              {query.tool}
            </div>
          </LinkIfNeeded>
          <div
            className='flex gap-2 items-end'
          >
            <ClockIcon />
            {toDateTimeString(image.createdAt)}
          </div>
          {(query.params.prompt) && (
            <div
              className='flex gap-2 items-end'
            >
              <PromptIcon />
              {query.params.prompt}
            </div>
          )}
          {(query.params.aspectRatio) && (
            <div
              className='flex gap-2 items-end'
            >
              <AspectRatioIcon />
              {query.params.aspectRatio}
            </div>
          )}
          {('width' in image && 'height' in image) && (
            <div
              className='flex gap-2 items-end'
            >
              <AspectRatioIcon />
              {image.width}x{image.height}
            </div>
          )}
          {'seed' in image && (
            <div
              className='flex gap-2 items-end'
            >
              <SeedIcon />
              {image.seed}
            </div>
          )}
          {query.contents.length > 0 && (
            <div
              className='flex flex-col gap-2'
            >
              <div
                className='flex items-end gap-2'
              >
                <VariationIcon />
                Variations:
              </div>
              <div
                className='gap-1 grid grid-cols-4 items-end'
              >
                {query.contents
                  .map(findImageByUuid)
                  .map((img, index) => (
                    <MediaComponent
                      className={classnames(
                        'cursor-pointer h-auto rounded-sm w-full',
                        img!.uuid === image.uuid ? 'border-2 border-accent' : 'border',
                      )}
                      key={index}
                      media={img!}
                      modelClassName='aspect-square h-auto'
                      modelProps={{
                        'auto-rotate': true,
                        'rotation-per-second': '400%',
                      }}
                      onClick={() => {
                        if (img!.uuid === image.uuid) {
                          return;
                        }
                        onImageClick(img!.uuid);
                      }}
                    />
                ))}
              </div>
            </div>
          )}
          {'generatedFrom' in image && image.generatedFrom.length > 0 && (
            <div
              className='flex flex-col gap-2'
            >
              <div
                className='flex items-end gap-2'
              >
                <ArrowBackIcon />
                From:
              </div>
              <div
                className='gap-1 grid grid-cols-4 items-end'
              >
                {image.generatedFrom
                  .map(findImageByUuid)
                  .map((img, index) => (
                    <MediaComponent
                      className={classnames(
                        'border cursor-pointer h-auto rounded-sm w-full',
                      )}
                      key={index}
                      media={img!}
                      modelClassName='aspect-square h-auto'
                      modelProps={{
                        'auto-rotate': true,
                        'rotation-per-second': '400%',
                      }}
                      onClick={() => {
                        onImageClick(img!.uuid);
                      }}
                    />
                  ))}
              </div>
            </div>
          )}
          {'generatedTo' in image && image.generatedTo.length > 0 && (
            <div
              className='flex flex-col gap-2'
            >
              <div
                className='flex items-end gap-2'
              >
                <ArrowForwardIcon />
                To:
              </div>
              <div
                className='gap-1 grid grid-cols-4 items-end'
              >
                {image.generatedTo
                  .map(findImageByUuid)
                  .map((img, index) => (
                    <MediaComponent
                      className={classnames(
                        'border cursor-pointer h-auto rounded-sm w-full',
                      )}
                      key={index}
                      media={img!}
                      modelClassName='aspect-square h-auto'
                      modelProps={{
                        'auto-rotate': true,
                        'rotation-per-second': '400%',
                      }}
                      onClick={() => {
                        onImageClick(img!.uuid);
                      }}
                    />
                  ))}
              </div>
            </div>
          )}
          <div>
            { /* Not sure if this icon is good for actions */ }
            <div
              className='flex gap-2 items-end'
            >
              <ActionIcon />
              Actions:
            </div>
            <ul
              className='menu'
            >
              {
                [
                  {
                    icon: <DownloadIcon />,
                    label: 'Download',
                    // TODO: Implement properly
                    path: '',
                    tools: Tools.map(def => def.name),
                  },
                  {
                    icon: <DownloadIcon />,
                    label: 'Download (HQ)',
                    // TODO: Implement properly
                    path: '',
                    tools: Tools.map(def => def.name),
                  },
                  {
                    icon: <RetryIcon />,
                    label: 'Retry',
                    // TODO: Implement properly
                    path: '',
                    tools: Tools.map(def => def.name),
                  },
                  {
                    icon: <VariationIcon />,
                    label: 'Make variation',
                    // TODO: Implement properly
                    path: '',
                    tools: Tools.filter(def => def.randomness).map(def => def.name),
                  },
                ]
                .filter(params => params.tools.includes(query.tool))
                .map((params, index) => (
                  <li
                    key={index}
                  >
                    <Link to={`${params.path}`}>
                      <div
                        className='flex gap-2 items-end'
                      >
                        {params.icon}
                        {params.label}
                      </div>
                    </Link>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

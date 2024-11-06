import classnames from "classnames";

const OutlinedIcon = ({ className, name }: { className?: string, name: string }): JSX.Element => {
  return (
    <span
      className={classnames(
        'material-symbols-outlined',
        className
      )}
    >
      {name}
    </span>
  );
};

export const ActionIcon = ({ className }: { className?: string }): JSX.Element => {
  // TODO: Replace with better icon
  return (
    <OutlinedIcon
      className={className}
      name='touch_app'
    />
  );
};

export const ArrowBackIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='arrow_back'
    />
  );
};

export const ArrowForwardIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='arrow_forward'
    />
  );
};

export const AspectRatioIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='aspect_ratio'
    />
  );
};

export const Box3DIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='deployed_code'
    />
  );
};

export const CopyIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='content_copy'
    />
  );
};

export const ClockIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='schedule'
    />
  );
};

export const DeleteForeverIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='delete_forever'
    />
  );
};

export const DownloadIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='download'
    />
  );
};

export const DrawIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='draw'
    />
  );
};

export const EditIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='edit'
    />
  );
};

export const EditToolIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <EditIcon
      className={classnames(
        'border-2 border-[#A4A90E] rounded-md text-[#A4A90E]',
        className,
      )}
    />
  );
};

export const EraserIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='ink_eraser'
    />
  );
};

export const ErrorIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='error'
    />
  );
};

export const FinishingUpIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={classnames(
        'border-2 border-[#eb4e3a] rounded-md text-[#eb4e3a]',
        className
      )}
      name='check'
    />
  );
};

export const FolderIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='folder'
    />
  );
};

export const GalleryIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <FolderIcon
      className={classnames(
        'border-2 border-[#9dd73a] rounded-md text-[#9dd73a]',
        className,
      )}
    />
  );
};

export const Generation3DIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <Box3DIcon
      className={classnames(
        'border-2 border-[#3cd1d6] rounded-md text-[#3cd1d6]',
        className
      )}
    />
  );
};

export const HomeIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={classnames(
        'border-2 border-[#d7d43a] rounded-md text-[#d7d43a]',
        className
      )}
      name='home'
    />
  );
};

export const ImageIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='image'
    />
  );
};

export const ImageGenerationIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <ImageIcon
      className={classnames(
        'border-2 border-[#4A7ABC] rounded-md text-[#4A7ABC]',
        className
      )}
    />
  );
};

export const InfoIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='info'
    />
  );
};

export const NodeEditorIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={classnames(
        'border-2 border-[#c6e639] rounded-md text-[#c6e639]',
        className
      )}
      name='polyline'
    />
  );
};

export const PromptIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='edit_note'
    />
  );
};

export const RedoIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='redo'
    />
  );
};

export const RetryIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='replay'
    />
  );
};

export const SeedIcon = ({ className }: { className?: string }): JSX.Element => {
  // TODO: Replace with better icon?
  return (
    <OutlinedIcon
      className={className}
      name='psychiatry'
    />
  );
};

export const ToolIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='build'
    />
  );
};

export const UndoIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='undo'
    />
  );
};

export const UploadIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='upload_file'
    />
  );
};

export const VariationIcon = ({ className }: { className?: string }): JSX.Element => {
  // TODO: Replace with better icon
  return (
    <OutlinedIcon
      className={className}
      name='alt_route'
    />
  );
};

export const VideoIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='videocam'
    />
  );
};

export const VideoGenerationIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <VideoIcon
      className={classnames(
        'border-2 border-[#f4e13a] rounded-md text-[#f4e13a]',
        className
      )}
    />
  );
};

export const VisibilityIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='visibility'
    />
  );
};

export const VisibilityOffIcon = ({ className }: { className?: string }): JSX.Element => {
  return (
    <OutlinedIcon
      className={className}
      name='visibility_off'
    />
  );
};

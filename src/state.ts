// TODO: Rename this file?

import { atom } from "recoil";

// TODO: Move to more appropriate place?
export const AspectRatioValues = [
  '21:9',
  '16:9',
  '3:2',
  '5:4',
  '1:1',
  '4:5',
  '2:3',
  '9:16',
  '9:21',
] as const;
export type AspectRatioType = (typeof AspectRatioValues)[number];

export type MediaType = 'image' | 'model3d' | 'video';

export type MediaBase = {
  createdAt: number;
  generatedFrom: string /* UUID of MediaBase */ [];
  generatedTo: string /* UUID of MediaBase */ [];
  query: string /* UUID of Query */;
  src: string;
  type: MediaType;
  uuid: string;
};

export type GeneratedMedia = {
  seed?: number;
  success?: boolean;
}

export type ImageBase = MediaBase & {
  height: number;
  width: number;
};

export type GeneratedImage = ImageBase & GeneratedMedia;
export type UploadedImage = ImageBase;

export type VideoBase = MediaBase & {
  // TODO: Anything else?
  duration: number;
  height: number;
  width: number;
};

export type GeneratedVideo = VideoBase & GeneratedMedia;

export type Model3D = MediaBase;
export type GeneratedModel3D = Model3D & GeneratedMedia;

export type Media = GeneratedImage | GeneratedModel3D | GeneratedVideo | UploadedImage;

// TODO: Rename to mediasState?
export const imagesState = atom<Media[]>({
  key: 'imagesState',
  default: [],
});

export type Query = {
  contents: string /* UUID of ImageBase */ [];
  createdAt: number;
  tool: string;
  // TODO: Avoid any to exploit static type checks if possible
  params: Record<string, any>;
  uuid: string;
};

export const queriesState = atom<Query[]>({
  key: 'queriesState',
  default: [],
});

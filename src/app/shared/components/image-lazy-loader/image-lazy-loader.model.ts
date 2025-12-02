export type ImageLazyLoaderStateModel = {
  url: string;
  hasData: boolean;
};

export const initialState: ImageLazyLoaderStateModel = {
  hasData: false,
  url: '/assets/img/svg/folder-denied.svg',
};

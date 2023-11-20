export type Config = {images: string[]; allImages: string[]; task: string};

export type ImageContent = {
  type: string;
  image_url: {
    url: string;
  };
}[];

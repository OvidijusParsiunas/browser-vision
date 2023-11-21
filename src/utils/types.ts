export type Config = {images: string[]; allImages: string[]; instruction: string; isAutoActive: boolean};

type ImageContent = {
  type: string;
  image_url: {
    url: string;
  };
}[];

export interface OpenAIBody {
  model: string;
  max_tokens?: number;
  messages: {role: string; content: string | ImageContent}[];
}

export interface OpenAIResult {
  choices: {message: {content: string}}[];
}

import { useEffect, useRef, useState } from 'react';

import {
  Button,
  FileInput,
  Flex,
  Image,
  Select,
  SelectItem,
  Stack,
  Text
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';

type SelectedAPI = 'every' | 'face' | 'present';

type Cords = {
  x: number;
  y: number;
};

type PresentIDResponse = {
  data: {
    rectangle: {
      lb: Cords;
      lt: Cords;
      rb: Cords;
      rt: Cords;
    };
  }[];
};

type FaceResponse = {
  faces: {
    face_rectangle: {
      x: number;
      y: number;
      top: number;
      height: number;
    };
  }[];
};

type EveryPixelResponse = {
  faces: {
    bbox: number[];
  }[];
};

const selectData: SelectItem[] = [
  {
    label: 'Every Pixel Api'.toUpperCase(),
    value: 'every'
  },
  {
    label: 'Face Plus Plus Api'.toUpperCase(),
    value: 'face'
  },
  {
    label: 'Present Id Api'.toUpperCase(),
    value: 'present'
  }
];

const Service = (selectedAPI: SelectedAPI) => {
  switch (selectedAPI) {
    case 'every': {
      return async (image: File) => {
        const postData = new FormData();
        postData.append('data', image);

        const { data } = await axios.post<EveryPixelResponse>(
          `${import.meta.env.VITE_EVERY_PIXEL_API_URL}`,
          postData,
          {
            headers: {
              Authorization: `Basic ${btoa(
                `${import.meta.env.VITE_EVERY_PIXEL_API_KEY}:${
                  import.meta.env.VITE_EVERY_PIXEL_API_SECRET
                }`
              )}`
            }
          }
        );

        return data;
      };
    }
    case 'face': {
      return async (image: File) => {
        const postData = new FormData();
        postData.append('image_file', image);
        postData.append('api_key', import.meta.env.VITE_FACE_API_KEY);
        postData.append('api_secret', import.meta.env.VITE_FACE_API_SECRET);

        const { data } = await axios.post<FaceResponse>(
          `${import.meta.env.VITE_FACE_API_URL}`,
          postData
        );

        return data;
      };
    }
    case 'present': {
      return async (image: File) => {
        const postData = new FormData();
        postData.append('photo', image);

        const { data } = await axios.post<PresentIDResponse>(
          `${import.meta.env.VITE_PRESENT_ID_API_URL}`,
          postData,
          {
            headers: {
              'X-RapidAPI-Key': import.meta.env.VITE_PRESENT_ID_API_KEY,
              'X-RapidAPI-Host': import.meta.env.VITE_PRESENT_ID_API_HOST
            }
          }
        );

        return data;
      };
    }
  }
};

const FRAME_STYLE = {
  width: 0,
  height: 0,
  left: 0,
  top: 0
};

const getCordsByAPI = (selectedAPI: SelectedAPI) => {
  switch (selectedAPI) {
    case 'every': {
      return (response: EveryPixelResponse) => {
        const face = response.faces[0];
        const coords = face.bbox;
        const width = coords[2] - coords[0];
        const height = coords[3] - coords[1];
        return { left: coords[0], top: coords[1], width, height };
      };
    }
    case 'face': {
      return (response: FaceResponse) => {
        return response.faces[0].face_rectangle;
      };
    }
    case 'present': {
      return (response: PresentIDResponse) => {
        if (!response.data) return FRAME_STYLE;
        const faces = response.data.map(face => {
          const coords = [
            face.rectangle.lb,
            face.rectangle.lt,
            face.rectangle.rb,
            face.rectangle.rt
          ];
          const x_coords = coords.map(coord => coord.x);
          const y_coords = coords.map(coord => coord.y);
          const left = Math.min(...x_coords);
          const right = Math.max(...x_coords);
          const top = Math.min(...y_coords);
          const bottom = Math.max(...y_coords);
          const width = right - left;
          const height = bottom - top;

          return { left, top, width, height };
        });
        return faces[0];
      };
    }
    default:
      return () => FRAME_STYLE;
  }
};

const getImageSrc = (file: File | null) => {
  if (!file) {
    return;
  }

  const fileReader = new FileReader();
  return new Promise<string>(resolve => {
    fileReader.onload = () => {
      resolve(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  });
};

export const App = () => {
  const selectedAPI = useRef<SelectedAPI>('every');

  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string>('');

  const [frameStyle, setFrameStyle] = useState(() => FRAME_STYLE);

  useEffect(() => {
    setFrameStyle(FRAME_STYLE);
  }, [src]);

  return (
    <Stack p='md' w={500} className='mx-auto'>
      <Flex align='center' gap='md' justify='center' m='md'>
        <Text component='h1'>Детекция лиц с помощью сервиса</Text>
        <Select
          defaultValue={selectedAPI.current}
          data={selectData}
          onChange={selected => {
            selectedAPI.current = selected as SelectedAPI;
          }}
        />
      </Flex>
      <Flex justify='center'>
        <FileInput
          onChange={async changeFile => {
            if (!changeFile) {
              return;
            }

            const src = await getImageSrc(changeFile);
            src && setSrc(src);
            setFile(changeFile);
          }}
          w='100%'
          placeholder='Добавьте файл png, jpg'
          accept='.png,.jpeg,.jpg'
        />
      </Flex>
      <Flex justify='end'>
        <Button
          onClick={async () => {
            if (!file) {
              showNotification({
                title: 'Ошибка отправки',
                message: 'Файла не найдено!'
              });
              return;
            }
            frameStyle.height && setFrameStyle(FRAME_STYLE);

            try {
              const response = await Service(selectedAPI.current)?.(file);
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              const cords = getCordsByAPI(selectedAPI.current)(response);
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              setFrameStyle(cords);
            } catch (e) {
              showNotification({
                title: 'Ошибка отправки',
                message: (e as Error)?.message
              });
            }
          }}
        >
          Отправить
        </Button>
      </Flex>
      {src && (
        <Stack>
          <Text>Исходное изображение:</Text>
          <Flex className='mx-auto'>
            <Image src={src} alt='initial' />
          </Flex>
        </Stack>
      )}
      {!!frameStyle.height && (
        <Stack>
          <Text>Результат:</Text>
          <Flex pos='relative' className='mx-auto'>
            <img src={src} alt='result' />
            <div
              className='absolute border-2 border-solid border-[#24fc03]'
              style={frameStyle}
            />
          </Flex>
        </Stack>
      )}
    </Stack>
  );
};

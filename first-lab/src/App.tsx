import { useEffect, useState } from 'react';

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
import axios from 'axios';

const selectData: SelectItem[] = [
  {
    label: 'Every Pixel Api',
    value: 'every'
  },
  {
    label: 'Face Plus Plus Api',
    value: 'face'
  },
  {
    label: 'Present Id Api',
    value: 'present'
  }
];

const Service = {
  async getFaceApi(image: File) {
    const postData = {
      image_file: image,
      api_key: import.meta.env.VITE_FACE_API_KEY,
      api_secret: import.meta.env.VITE_FACE_API_SECRET
    };

    console.log(postData);

    const { data } = await axios.post(
      `${import.meta.env.VITE_FACE_API_URL}`,
      postData
    );

    console.log(data);
  },
  async getPresentIdApi(image: File) {
    const postData = new FormData();
    postData.append('photo', image);

    const { data } = await axios.post(
      `${import.meta.env.VITE_PRESENT_ID_API_URL}`,
      postData,
      {
        headers: {
          'X-RapidAPI-Key': import.meta.env.VITE_PRESENT_ID_API_KEY,
          'X-RapidAPI-Host': import.meta.env.VITE_PRESENT_ID_API_HOST
        }
      }
    );

    console.log(data);
    return data;
  },
  async getEveryPixelApi(image: File) {
    const postData = new FormData();
    postData.append('photo', image);

    const { data } = await axios.post(
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

    // console.log(data);
    return data;
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

const FRAME_STYLE = {
  width: 0,
  height: 0,
  left: 0,
  top: 0
};

export const App = () => {
  const [api, setApi] = useState('present');

  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string>('');

  const [style, setStyle] = useState(() => FRAME_STYLE);

  useEffect(() => {
    setStyle(FRAME_STYLE);
  }, [src]);

  return (
    <Stack p='md'>
      <Flex align='center' gap='md' justify='center' m='md'>
        <Text component='h1'>Детекция лиц с помощью сервиса</Text>
        <Select
          defaultValue='present'
          data={selectData}
          onChange={selected => setApi(selected!)}
        />
      </Flex>
      <Flex justify='center'>
        <FileInput
          onChange={async file => {
            console.log(file);

            const src = await getImageSrc(file!);
            setSrc(src);
            setFile(file);
          }}
          w='20rem'
          placeholder='Добавьте файл png, jpg'
          accept='.png,.jpeg,.jpg'
        />
      </Flex>
      <Flex justify='end'>
        <Button
          onClick={async () => {
            if (!file) {
              return;
            }

            const response = await Service.getPresentIdApi(file);
            setStyle({ left: 0, top: 0, width: 0, height: 0 });

            if (!response.data) return [];
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
              setStyle({ left, top, width, height });

              return { left, top, width, height };
            });
          }}
        >
          Отправить
        </Button>
      </Flex>

      <Flex pos='relative' className='mx-auto'>
        <Image src={src} />
        {!!style.height && (
          <div
            className='absolute border-2 border-solid border-[#24fc03]'
            style={style}
          />
        )}
      </Flex>
    </Stack>
  );
};

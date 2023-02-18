import { useState } from 'react';

import { Button, Flex, Stack, Text, Textarea } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import axios from 'axios';

type RuGPTResponse = {
  generated_text: string;
};

const Service = {
  async getContinueText(begin: string) {
    const { data } = await axios.post<RuGPTResponse[]>(
      import.meta.env.VITE_API_URL,
      begin,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`
        }
      }
    );

    return data[0];
  }
};

export const App = () => {
  const [beginText, setBeginText] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!beginText) {
      showNotification({
        title: 'Ошибка',
        message: 'Заполните поле'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await Service.getContinueText(beginText);
      response && setGeneratedText(response.generated_text);
    } catch (e) {
      const err = e as Error;
      showNotification({
        title: 'Ошибка',
        message: err.message.match(/503/)
          ? 'Сервис загружен, повторите позднее'
          : err.message
      });
    }
    setIsLoading(false);
  };

  return (
    <Flex p='md' justify='center'>
      <Stack w={450}>
        <Text component='h2' weight='bold' className='mx-auto'>
          Генерация текста с помощью Sber GPT3
        </Text>
        <Textarea
          value={beginText}
          onChange={e => setBeginText(e.target.value)}
          placeholder='Введите начало текста'
        />
        <Button
          onClick={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          className='ml-auto'
        >
          Отправить
        </Button>

        {generatedText && (
          <>
            <Text component='h2' weight='bold' className='mx-auto'>
              Результат
            </Text>
            <Textarea readOnly value={generatedText} w='200' />
          </>
        )}
      </Stack>
    </Flex>
  );
};

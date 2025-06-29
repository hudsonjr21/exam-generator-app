'use client';

import ptBR from '../locales/pt-BR.json';

// Exportamos estes tipos para que outros componentes possam usá-los
export type TranslationKey = keyof typeof ptBR;
export type TranslationFunction = (key: TranslationKey) => string;

const translations = {
  'pt-BR': ptBR,
};

const currentLocale = 'pt-BR';

const useTranslation = (): { t: TranslationFunction } => {
  const t = (key: TranslationKey): string => {
    return translations[currentLocale][key] || key;
  };

  return { t };
};

export default useTranslation;

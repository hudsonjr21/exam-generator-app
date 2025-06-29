import ptBR from '../locales/pt-BR.json';

const translations = {
'pt-BR': ptBR,
};

const currentLocale = 'pt-BR'; // Por enquanto, fixo em português

type TranslationKey = keyof typeof ptBR;

const useTranslation = () => {
const t = (key: TranslationKey) => {
return translations['pt-BR'][key] || key; // Retorna a chave se a tradução não existir
};

return { t };
};

export default useTranslation;
import jsPDF from 'jspdf';

// Интерфейс для конфигурации шрифта
interface FontConfig {
  name: string;
  style: 'normal' | 'bold' | 'italic';
}

// Конфигурация шрифтов
const fonts: FontConfig[] = [
  {
    name: 'helvetica',
    style: 'normal',
  },
  {
    name: 'helvetica',
    style: 'bold',
  },
  {
    name: 'helvetica',
    style: 'italic',
  },
];

// Функция для загрузки и регистрации шрифта
export async function loadFont(doc: jsPDF, fontName: string): Promise<boolean> {
  const font = fonts.find((f) => f.name === fontName && f.style === 'normal');
  if (!font) {
    console.warn(`Шрифт ${fontName} не найден, используется helvetica`);
    doc.setFont('helvetica', 'normal');
    return false;
  }

  try {
    // Используем встроенный шрифт helvetica, который поддерживает кириллицу
    doc.setFont(font.name, font.style);
    return true;
  } catch (error) {
    console.error(`Ошибка при установке шрифта ${fontName}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    doc.setFont('helvetica', 'normal'); // Fallback на helvetica
    return false;
  }
}

// Функция для получения доступных шрифтов
export function getAvailableFonts(): string[] {
  return fonts.map((f) => f.name);
}
/**
 * Форматирует имя клиента для корректного отображения
 * Приводит к правильному регистру (первая буква заглавная, остальные строчные)
 */
export function formatClientName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  // Убираем лишние пробелы в начале и конце
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return '';
  }

  // Разбиваем на слова (имя, фамилия, отчество)
  const words = trimmedName.split(/\s+/);
  
  // Форматируем каждое слово
  const formattedWords = words.map(word => {
    if (!word) return '';
    
    // Приводим к нижнему регистру, затем делаем первую букву заглавной
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  // Соединяем слова обратно
  return formattedWords.join(' ');
}
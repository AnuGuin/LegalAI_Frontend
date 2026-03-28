export function mdToPassage(text: string) {
  if (!text) return "";

  return text
    .replace(/[*_`>#-]/g, "")
    .replace(/\d+\.\s+/g, "")  
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;])/g, "$1") 
    .trim();
}
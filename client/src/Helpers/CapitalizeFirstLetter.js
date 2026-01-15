export const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  const value = String(str).trim();
  if (!value) return "";
  return value
    .split(/\s+/)
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ""
    )
    .join(" ");
};

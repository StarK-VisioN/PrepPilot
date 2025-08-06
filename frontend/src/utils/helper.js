export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const getInitials = (title) => {
  if (!title) return "";

  const words = title.trim().split(/\s+/); // split on any space, remove extras

  if (words.length === 1) {
    return words[0][0].toUpperCase(); // just one word
  }

  return (words[0][0] + words[1][0]).toUpperCase(); // first two words
};

// Dicionário de erros conhecidos
const errorMessages = {
  'Invalid login credentials': 'Email ou senha inválidos.',
  'Email not confirmed': 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada.',
  'Password should be at least 6 characters': 'A senha deve ter no mínimo 6 caracteres.',
  'User already registered': 'Este email já está registrado. Tente fazer login.',
  // A mensagem longa sobre os requisitos da senha
  'Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789, !@#$%^&*()_+-=[]{};\':"|<>?,./`~': 'A senha é muito fraca. Tente combinar letras maiúsculas, minúsculas, números e símbolos.',
};

// Função que traduz a mensagem ou retorna a original se não for encontrada
export const translateSupabaseError = (message) => {
  // Procura por uma correspondência exata primeiro
  if (errorMessages[message]) {
    return errorMessages[message];
  }
  // Se não encontrar, procura por uma correspondência parcial
  for (const key in errorMessages) {
    if (message.includes(key)) {
      return errorMessages[key];
    }
  }
  // Se ainda assim não encontrar, retorna a mensagem original em inglês
  return message;
};
// Sistema mnemônico principal (Major System): cada algarismo é um som de consoante;
// vogais, H, W e Y não valem nada. Assim qualquer número vira palavras fáceis de imaginar.

// `lembrete`: palavra para lembrar a letra de cada número; só a primeira letra importa.
export const TABELA = [
  { digito: '0', letras: 'S, Z, Ç', nota: 'e C antes de E/I', lembrete: 'Sz' },
  { digito: '1', letras: 'T, D', nota: '', lembrete: 'Tudo' },
  { digito: '2', letras: 'N', nota: 'e NH', lembrete: 'Nada' },
  { digito: '3', letras: 'M', nota: '', lembrete: 'Morte' },
  { digito: '4', letras: 'R', nota: 'RR conta uma vez', lembrete: 'Rocket' },
  { digito: '5', letras: 'L', nota: 'e LH', lembrete: 'League' },
  { digito: '6', letras: 'J, X, CH', nota: 'e G antes de E/I', lembrete: 'Xj' },
  { digito: '7', letras: 'K, Q', nota: 'C e G duros: ca, co, cu, ga, go, gu', lembrete: 'Kaguya' },
  { digito: '8', letras: 'F, V', nota: '', lembrete: 'Favo' },
  { digito: '9', letras: 'P, B', nota: '', lembrete: 'Pb' },
];

// Sugestões de palavras (fáceis de visualizar) para 0–9 e 00–99. Você pode trocar qualquer uma no app.
export const PALAVRAS_PADRAO = {
  0: 'asa', 1: 'teia', 2: 'anão', 3: 'mão', 4: 'rei', 5: 'lua', 6: 'chá', 7: 'cão', 8: 'ave', 9: 'boi',
  '00': 'Zeus', '01': 'seta', '02': 'sino', '03': 'sumô', '04': 'serra', '05': 'sola', '06': 'soja', '07': 'saco', '08': 'sofá', '09': 'sapo',
  10: 'taça', 11: 'dedo', 12: 'duna', 13: 'dama', 14: 'touro', 15: 'tela', 16: 'tacho', 17: 'taco', 18: 'divã', 19: 'tubo',
  20: 'noz', 21: 'nota', 22: 'nenê', 23: 'Nemo', 24: 'nora', 25: 'anel', 26: 'nacho', 27: 'nuca', 28: 'neve', 29: 'nabo',
  30: 'mesa', 31: 'moto', 32: 'mina', 33: 'múmia', 34: 'mar', 35: 'mel', 36: 'mecha', 37: 'mago', 38: 'mofo', 39: 'mapa',
  40: 'rosa', 41: 'rato', 42: 'rena', 43: 'remo', 44: 'arara', 45: 'rolo', 46: 'rocha', 47: 'arco', 48: 'rifa', 49: 'roupa',
  50: 'laço', 51: 'lata', 52: 'lona', 53: 'lima', 54: 'louro', 55: 'lula', 56: 'lixo', 57: 'lago', 58: 'luva', 59: 'lobo',
  60: 'juiz', 61: 'jato', 62: 'gênio', 63: 'gema', 64: 'jarra', 65: 'gelo', 66: 'chuchu', 67: 'jaca', 68: 'chave', 69: 'jipe',
  70: 'casa', 71: 'gato', 72: 'cano', 73: 'cama', 74: 'carro', 75: 'cola', 76: 'caixa', 77: 'coco', 78: 'café', 79: 'capa',
  80: 'vaso', 81: 'fita', 82: 'fone', 83: 'fumo', 84: 'fera', 85: 'vela', 86: 'faixa', 87: 'faca', 88: 'fava', 89: 'fubá',
  90: 'pizza', 91: 'pato', 92: 'pena', 93: 'puma', 94: 'pera', 95: 'bola', 96: 'peixe', 97: 'bico', 98: 'pavão', 99: 'pipa',
};

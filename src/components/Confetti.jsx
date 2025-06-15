import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Confetti = () => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    const createPieces = () => {
      const newPieces = [];
      const numPieces = 100; // Número de confetes caindo

      for (let i = 0; i < numPieces; i++) {
        newPieces.push({
          id: i,
          // 1. Posição inicial X aleatória
          startX: `${Math.random() * 100}%`,
          // 2. Balanço horizontal durante a queda
          sway: Math.random() * 40 - 20,
          // 3. Rotação lenta e aleatória
          rotation: Math.random() * 360,
          // Cores em tons de amarelo
          color: `hsl(${40 + Math.random() * 20}, ${90 + Math.random() * 10}%, ${60 + Math.random() * 10}%)`,
          // 4. Duração e atraso aleatórios para uma queda mais natural
          duration: Math.random() * 4 + 3, // Duração entre 3s e 7s
          delay: Math.random() * 5,       // Atraso para que não caiam todos de uma vez
        });
      }
      setPieces(newPieces);
    };

    createPieces();
  }, []);

  return (
    <div className="confetti-fall-container">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="confetti-piece"
          style={{ 
            backgroundColor: p.color,
            left: p.startX, // Posição X inicial
          }}
          // Posição inicial: Acima do container
          initial={{ y: -50, opacity: 1 }}
          // Animação final: Cai até o fundo e balança para o lado
          animate={{ 
            y: 500, // Um valor alto para garantir que atravesse toda a div
            x: p.sway,
            rotate: p.rotation,
          }}
          transition={{
            // 5. 'easeIn' simula a aceleração da gravidade
            ease: "easeIn", 
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity, // Faz a animação repetir infinitamente
            repeatType: "loop",
            repeatDelay: 2, // Espera 2s para reiniciar a queda
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
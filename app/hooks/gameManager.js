import { useState } from "react";
//todo o gamemanager
export default function useGameManager() {
  const MAX_LIFE_BASE = 100;

//gerar inimigos
  function generateEnemy(index) {
    if (index % 4 === 0 && index < 25) {
      return {
        //status do guarda
        name: "Guarda esfomeado",
        life: 120,
        maxLife: 120,
        damage: 25,
        type: "elite",
        healed: false,
        isIntimidated: false,
        originalDamage: null,
        image: "guarda.png"
      };
    } else if (index === 25) {
      return {
        //status do rei
        name: "O Rei sem fome",
        life: 250,
        maxLife: 250,
        damage: 40,
        type: "boss",
        healsLeft: 2,
        isIntimidated: false,
        originalDamage: null,
        //image:"rei.png"
      };
    } else {
      return {
        //status do sorrateiro
        name: `Zumbi Sorrateiro`,
        life: 60,
        maxLife: 60,
        damage: 15,
        type: "common",
        isIntimidated: false,
        originalDamage: null,
        image:"sorrateiro.png"
      };
    }
  }
//status do faminto
  const [hero, setHero] = useState({
    life: MAX_LIFE_BASE,
    maxLife: MAX_LIFE_BASE,
    name: "O Faminto",
    healCount: 2,
    attackPower: 25,
    intimidatePower: 0.3,
    image:"faminto.png"
  });
//get set
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [enemy, setEnemy] = useState(generateEnemy(1));
  const [isHeroTurn, setIsHeroTurn] = useState(true);
  const [gameStage, setGameStage] = useState("start");
  const [isHeroIntimidated, setIsHeroIntimidated] = useState(false);
  const [permanentlyIntimidated, setPermanentlyIntimidated] = useState(false);
  const [log, setLog] = useState([]);
//inicio do jogo
  const startGame = () => {
    setGameStage("battle");
    setIsHeroTurn(true);
    setLog([]);
  };
//log de mensagens
  const addLog = (message) => {
    setLog((prev) => [...prev, message]);
  };
//calculo de dano e morte
 const modifyLife = (target, amount) => {
  if (target === "hero") {
    setHero(prev => {
      const newLife = Math.min(prev.maxLife, Math.max(0, prev.life + amount));

      if (newLife === 0) {
        setGameStage("lost");
      }

      return { ...prev, life: newLife };
    });
  } else {
    setEnemy(prev => {
      const newLife = Math.min(prev.maxLife, Math.max(0, prev.life + amount));

      if (newLife === 0) {
        setGameStage("consume");
      }

      return { ...prev, life: newLife };
    });
  }
};

//ações do jogador
  const actions = {
    Attack: () => {
      let damage = hero.attackPower;
      if (permanentlyIntimidated) {
        damage = Math.floor(damage * 0.5);
      }
      if (isHeroIntimidated) {
        damage = Math.floor(damage * 0.5);
        addLog(
          `${hero.name} está intimidado e causa apenas ${damage} de dano.`
        );
      } else {
        addLog(`${hero.name} causa ${damage} de dano.`);
      }
      modifyLife("enemy", -damage);

    },
    intimidate: () => {
      let logAlreadyAdded = false;

      setEnemy((prev) => {
        if (prev.isIntimidated) {
          if (!logAlreadyAdded) {
            addLog(`${prev.name} já está intimidado!`);
            logAlreadyAdded = true;
          }
          return prev;
        }

        const reducedDamage = prev.damage * (1 - hero.intimidatePower);
        if (!logAlreadyAdded) {
          addLog(
            `${
              hero.name
            } intimidou o inimigo. O dano dele virou ${Math.floor(reducedDamage)}!`
          );
          logAlreadyAdded = true;
        }

        return {
          ...prev,
          damage: reducedDamage,
          isIntimidated: true,
          originalDamage: prev.damage,
        };
      });


    },

    Heal: () => {
      if (hero.healCount > 0) {
        const healAmount = 30;
        modifyLife("hero", healAmount);
        setHero((prev) => ({ ...prev, healCount: prev.healCount - 1 }));
        addLog(`${hero.name} se curou em ${healAmount} pontos.`);

      }
    },
    Run: () => {
      resetGame(true);
    },
  };
//passagem de turnos
const handleHeroAction = (action) => {
  if (!isHeroTurn || gameStage !== "battle") return;

  setIsHeroIntimidated(false);

  actions[action]?.();

  if (action === "Run") return;

  setIsHeroTurn(false);

  setTimeout(() => {
    // a morte do inimigo já foi detectada em modifyLife
    if (enemy.life <= 0) return;

    enemyTurn();
  }, 1000);
};

//turno do inimigo
const enemyTurn = () => {
  if (gameStage !== "battle") return; // Impede turno fora da batalha
  if (enemy.life <= 0) {
    setIsHeroTurn(true);
    return;
  }
  let heroDamage = 0;
  let updatedEnemySnapshot = null; 

  // Intimidação do comum (ocorre antes de setEnemy)
  if (enemy.type === "common" && Math.random() < 0.2) {
    setIsHeroIntimidated(true);
    addLog(`${enemy.name} tentou te assustar!`);
    setTimeout(() => setIsHeroTurn(true), 500);
    return;
  }

  let localSkipAttack = false;
  let localEnraged = false;
  let localHealed = false;
  let localHealAmount = 0;

  setEnemy((currentEnemy) => {
    //  Evita alterações em inimigo morto
    if (currentEnemy.life <= 0) return currentEnemy;

    const updatedEnemy = { ...currentEnemy };

    // CURA (ELITE)
    if (
      updatedEnemy.type === "elite" &&
      !updatedEnemy.healed &&
      updatedEnemy.life <= updatedEnemy.maxLife / 2
    ) {
      updatedEnemy.life += 40;
      updatedEnemy.healed = true;
      localSkipAttack = true;
      localHealed = true;
      localHealAmount = 40;
    }

    // CURA (BOSS)
    if (
      updatedEnemy.type === "boss" &&
      updatedEnemy.life <= updatedEnemy.maxLife / 2 &&
      updatedEnemy.healsLeft > 0
    ) {
      updatedEnemy.life += 70;
      updatedEnemy.healsLeft -= 1;
      localSkipAttack = true;
      localHealed = true;
      localHealAmount = 70;
    }

    // FÚRIA (BOSS)
    if (
      updatedEnemy.type === "boss" &&
      updatedEnemy.life <= updatedEnemy.maxLife / 2 &&
      updatedEnemy.healsLeft === 0 &&
      !updatedEnemy.enraged
    ) {
      updatedEnemy.damage *= 1.5;
      updatedEnemy.enraged = true;
      localEnraged = true;
    }

    heroDamage = Math.floor(updatedEnemy.damage);
    updatedEnemySnapshot = { ...updatedEnemy };
    return updatedEnemy;
  });

  // Aguarda atualização para evitar race condition
  setTimeout(() => {
    //  Impede qualquer ação se o inimigo morreu durante a atualização
    if (!updatedEnemySnapshot || updatedEnemySnapshot.life <= 0) {
      setIsHeroTurn(true);
      return;
    }

    if (localHealed) {
      addLog(`${updatedEnemySnapshot.name} se curou em ${localHealAmount} pontos!`);
    }

    if (localEnraged) {
      addLog(`${updatedEnemySnapshot.name} entrou em fúria! Seu dano aumentou!`);
    }

    if (!localSkipAttack) {
      modifyLife("hero", -heroDamage);
      addLog(`${updatedEnemySnapshot.name} ataca e causa ${heroDamage} de dano!`);
    }

    setIsHeroTurn(true);
  }, 300);
};


//consumir e resultados de consumir o inimigo
  const consumeEnemy = () => {
    setIsHeroIntimidated(false)
    const healAmount = Math.floor(enemy.maxLife * 0.5);
    modifyLife("hero", healAmount);
    setHero((prev) => ({ ...prev, healCount: prev.healCount + 1 }));
    addLog(
      `${hero.name} consumiu os restos e curou ${healAmount} pontos de vida.`
    );
    setIsHeroTurn(true);
    if (enemy.type === "elite") {
      setGameStage("upgrade");
    } else if (enemy.type === "boss") {
      setPermanentlyIntimidated(false);
      setGameStage("finalDecision");
    } else {
      nextBattle();
    }
  };
//melhorias de personagem
  const applyUpgrade = (type) => {
    if (type === "life") {
      setHero((prev) => ({
        ...prev,
        maxLife: prev.maxLife + 20,
        life: prev.maxLife + 20,
      }));
      addLog(`${hero.name} aumentou sua vida máxima!`);
    } else if (type === "damage") {
      setHero((prev) => ({ ...prev, attackPower: prev.attackPower + 10 }));
      addLog(`${hero.name} ficou mais forte!`);
    } else if (type === "intimidate") {
      setHero((prev) => ({
        ...prev,
        intimidatePower: Math.min(1, prev.intimidatePower + 0.1),
      }));
      addLog(`${hero.name} aperfeiçoou sua intimidação!`);
    }
    nextBattle();
  };
//proxima batalha
  const nextBattle = () => {
  const nextIndex = currentEnemyIndex + 1;
  const newEnemy = generateEnemy(nextIndex);

  // Resetar completamente o estado de intimidação e o dano do inimigo
  newEnemy.isIntimidated = false;
  newEnemy.originalDamage = null;

  // Restaurar o dano original caso esteja reduzido
  if (typeof newEnemy.damage === "number" && newEnemy.originalDamage != null) {
    newEnemy.damage = newEnemy.originalDamage;
  }

  setCurrentEnemyIndex(nextIndex);
  setEnemy(newEnemy);
  setGameStage("battle");
  setIsHeroTurn(true);

  if (nextIndex === 25) {
    setPermanentlyIntimidated(true);
    addLog(
      `Você sente uma presença esmagadora... ${newEnemy.name} te intimida profundamente!`
    );
  } else {
    setPermanentlyIntimidated(false);
  }

  addLog(`Um novo inimigo apareceu!`);
};

//final do jogo
  const finalDecision = (choice) => {
    if (choice === "consume") {
      addLog(`${hero.name} consumiu o Rei sem Fome.`);
      setGameStage("endConsumed");
    } else {
      addLog(`${hero.name} destruiu o Rei sem Fome.`);
      setGameStage("endSpared");
    }
  };
//reiniciar jogo
  const resetGame = (maintainHeroTurn = false) => {
    setHero({
      life: MAX_LIFE_BASE,
      maxLife: MAX_LIFE_BASE,
      name: "O Faminto",
      healCount: 2,
      attackPower: 25,
      intimidatePower: 0.3,
      image:"faminto.png"
    });
    setCurrentEnemyIndex(0);
    setEnemy(generateEnemy(1));
    setGameStage("start");
    setIsHeroTurn(maintainHeroTurn);
    setLog([]);
    setPermanentlyIntimidated(false);
  };
//valores
  return {
    hero,
    enemy,
    isHeroTurn,
    handleHeroAction,
    gameStage,
    consumeEnemy,
    applyUpgrade,
    finalDecision,
    resetGame,
    log,
    startGame,
  };
}

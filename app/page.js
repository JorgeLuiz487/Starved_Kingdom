"use client";
import styles from "@/app/styles/styles.module.css";
import Character from "@/app/components/character";
import useGameManager from "@/app/hooks/gameManager";
//pagina principal
export default function StarvedKingdom() {
  const gameManager = useGameManager();

  return (
    <div className={styles.game_container}>
      {gameManager.gameStage === "start" && (//tela de inicio
        <div className="modal" style={{ textAlign: "center" , marginBottom: "15rem", fontSize:"2rem"}}>
          <h2>Starved Kingdom</h2>
          <p>
            Neste mundo, a fome rege os pensamentos.<br></br> Dizem que o rei está acima
            dessas regras.<br></br> Talvez, se consumir o rei... poderá fugir do instinto?
          </p>
          <br></br>
          <button onClick={gameManager.startGame} className={styles.button}>Iniciar Jogo</button>
        </div>
      )}

      {gameManager.gameStage !== "start" && (
        <div className={styles.container}>
          <div className={styles.charactersRow}>
            <Character
              data={gameManager.hero}
              isHeroi={true}
              action={gameManager.handleHeroAction}
              isHeroTurn={gameManager.isHeroTurn}
              gameStage={gameManager.gameStage}
              consumeEnemy={gameManager.consumeEnemy}
              applyUpgrade={gameManager.applyUpgrade}
              log={gameManager.log}
            />
            <Character
              data={gameManager.enemy}
              isHeroi={false}
              gameStage={gameManager.gameStage}
            />
          </div>
          
        </div>
      )}

      {gameManager.gameStage === "finalDecision" && (//final de jogo
        <div className={styles.fullscreen_centered}>
          <h2>Decisão Final</h2>
          <p>Você derrotou o Rei sem Fome. O que deseja fazer?</p>
          <button onClick={() => gameManager.finalDecision("consume")}>Consumir</button>
          <button onClick={() => gameManager.finalDecision("spare")}>Poupar</button>
        </div>
      )}

      {gameManager.gameStage === "endConsumed" && (
        <div className={styles.fullscreen_centered}>
          <h2>Coroado</h2>
          <p>
            E então a fome cessou. Um rei caiu e outro se ergueu. Um novo reinado se inicia, fadado ao mesmo ciclo.
          </p>
          <button onClick={gameManager.resetGame}>Recomece o ciclo</button>
        </div>
      )}

      {gameManager.gameStage === "endSpared" && (
        <div className={styles.fullscreen_centered}>
          <h2>Sonhos vazios</h2>
          <p>
            Ao destruir o Rei sem Fome e não consumi-lo, o rei não pode existir.
            Não existe mais um estado sem fome para todos almejarem. O ciclo se quebra aqui.
          </p>
          <button onClick={gameManager.resetGame}>Recomece o ciclo</button>
        </div>
      )}

    </div>
    
  );
}

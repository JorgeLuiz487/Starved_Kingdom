import Image from "next/image";
import styles from "@/app/styles/character.module.css"
import heroImg from "@/app/assets/images/faminto.png";
import guardaImg from "@/app/assets/images/guarda.png";
import sorrateiroImg from "@/app/assets/images/sorrateiro.png";
import consumeImg from "@/app/assets/images/consume.png";
import gameOverImg from "@/app/assets/images/gameOver.png"
import reiImg from "@/app/assets/images/rei.png";
//mapa de imagens
const imageMap = {
  "faminto.png": heroImg,
  "guarda.png": guardaImg,
  "sorrateiro.png": sorrateiroImg,
  "rei.png": reiImg,
};

//dados de personagens coletados
export default function Character({
  data,
  isHeroi,
  action,
  isHeroTurn,
  gameStage,
  consumeEnemy,
  applyUpgrade,
  log,
}) {
  //se nao houver dados retorna vazio
  if (!data) return null;
//barra de vida
  const LifeBar = ({ current, max ,color}) => {
    const percentage = (current / max) * 100;

    return (
      //visual da barra de vida
      <div className={styles.life_bar}>
        <div className={styles.life_fill} style={{ width: `${percentage}%` , backgroundColor: color}}></div>
        <span className={styles.life_text}>
          {current} / {max}
        </span>
      </div>
    );
  };
  
  //estagio para a tela de Game Over
  if (isHeroi && gameStage === "lost") {
    return (
      <div className={styles.fullscreen_centered} style={{ textAlign: "center" , marginBottom: "15rem", fontSize:"2rem"}}> {/* estilo para centralizar fullscreen */}
        <h2>Consumido.</h2>
        <Image src={gameOverImg}
             alt="Fim de Jogo"
             width={350}
             height={400}
             style={{ borderRadius: "5px", margin: 0  }}></Image>
        <p>Dos restos da batalha, amanhã alguém mais faminto levantará...</p>
        <button className={styles.button} onClick={() => window.location.reload()}>Recomeço</button>
      </div>
    );
  }

  return (
    //visuais de batalha
    <div className={styles.character_container}>
      <div className={styles.character} style={{marginRight: "10em"}}>
        
        <img
          src={imageMap[data.image]?.src}
          alt={data.name}
          className={styles.character_image}
        />

        <h2>{data.name}</h2>

        <LifeBar
          current={data.life}
          max={data.maxLife}
          color={isHeroi ? "red" : "green"} // verde para herói, vermelho para inimigos
        />

        {isHeroi && action && gameStage === "battle" && (
          //logica e estilo dos botoes para batalha 
          <div className={styles.action_row}>
            <button
              className={styles.button}
              disabled={!isHeroTurn}
              onClick={() => action("Attack")}
            >
              Atacar
            </button>
            <button
              className={styles.button}
              disabled={!isHeroTurn}
              onClick={() => action("intimidate")}
            >
              Intimidar
            </button>
            <button
              className={styles.button}
              disabled={!isHeroTurn || data.healCount <= 0}
              onClick={() => action("Heal")}
            >
              Curar ({data.healCount})
            </button>
            <button
              className={styles.button}
              disabled={!isHeroTurn}
              onClick={() => action("Run")}
            >
              Fugir
            </button>
          </div>
        )}

        {isHeroi && gameStage === "consume" && (//visuais e botoes para a mecânica de consumir
          <div className={styles.fullscreen_centered} style={{ textAlign: "center" , marginBottom: "15rem", fontSize:"2rem"}}>
             <Image src={consumeImg}
             alt="Consumir inimigo"
             width={350}
             height={400}
             style={{ borderRadius: "5px", margin: 0  }}></Image>
            <p>apenas a carcaça restou. faça apenas o natural.</p>
            <button className={styles.button} onClick={consumeEnemy}>Consumir</button>
          </div>
        )}

        {isHeroi && gameStage === "upgrade" && (//visuais e botões para melhoria
          <div className={styles.upgrade} style={{ textAlign: "center" , marginBottom: "15rem", fontSize:"2rem"}}>
            <p>Escolha uma melhoria:</p>
            <button className={styles.button} onClick={() => applyUpgrade("life")}>Aumentar Vida Máxima</button>
            <button className={styles.button} onClick={() => applyUpgrade("damage")}>Aumentar Dano</button>
            <button className={styles.button} onClick={() => applyUpgrade("intimidate")}>Melhorar Intimidação</button>
          </div>
        )}

        {isHeroi && log && ( //log de batalha
          <div className={styles.log}>
            <h3>Registro de Batalha</h3>
            <ul>
              {log.slice(-3).map((entry, index) => (
                <li key={index}>{entry}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

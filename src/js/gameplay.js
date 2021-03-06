//Estructura basica para uso del 'framework' Phaser v2

//variables

let Cant_Diamantes = 30;
let Cant_burbujas = 30;

//cuando se es llamado este metodo comienza la ejecucion de lo siguiente...
GamePlayManager = {
  //inicializar variables de nuestro juego
  init: function () {
    console.log("init");
    // escalar contenido del back a la pantalla, hacerlo responsive
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //alinear horizontal y vertical
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;

    //validacion para comenzar juego cuando se clickea la pantalla
    this.flagFirstMouseDown = false;

    //var para guardar los diamantes que agarramos
    this.amountDiamondsCaught = 0;

    //estado para saber cuando el juego termino
    this.endGame = false;

    //cambio de frame del caballo con ojos cerrados y ojos abiertos
    this.cuentaSonrisa = -1;

    //variables de musica
    let musica;
    let s;
  },
  // cargar los recursos para el proyecto
  preload: function () {
    console.log("preload");
    game.load.image("background", "/assets/image/background.png");
    game.load.spritesheet("horse", "/assets/image/horse.png", 84, 156, 2);
    game.load.spritesheet("diamonds", "/assets/image/diamonds.png", 81, 84, 4);
    game.load.spritesheet("explosion", "/assets/image/explosion.png");
    game.load.spritesheet("tiburon", "/assets/image/shark.png");
    game.load.spritesheet("peces", "/assets/image/fishes.png");
    game.load.spritesheet("medusa", "/assets/image/mollusk.png");
    game.load.spritesheet("burbuja1", "/assets/image/booble1.png");
    game.load.spritesheet("burbuja2", "/assets/image/booble2.png");
    game.load.audio("musicaBack", ["/assets/sounds/musicLoop.mp3"]);
  },
  // crea los recursos ya cargados para ser utilizados
  create: function () {
    console.log("create");
    //añadir sprite o recursos
    game.add.sprite(0, 0, "background");

    //agregar musica, definir su volumen en decimal y definir reproducir
    musica = game.add.audio("musicaBack");
    musica.volume = 0.5;
    musica.loop = true;
    musica.play();

    //agregar burbujas
    this.burbujasArray = [];
    ////guardar en un array, las brubujas con sus posiciones, velocidades y opacidades descritas
    for (let index = 0; index < Cant_burbujas; index++) {
      let xBurbuja = game.rnd.integerInRange(1, 1140);
      let yBurbuja = game.rnd.integerInRange(600, 950);

      let burbuja = game.add.sprite(
        xBurbuja,
        yBurbuja,
        "burbuja" + game.rnd.integerInRange(1, 2)
      );
      burbuja.vel = 0.2 + game.rnd.frac() * 2;
      burbuja.alpha = 0.9;
      burbuja.scale.setTo(0.2 + game.rnd.frac());
      this.burbujasArray[index] = burbuja;
    }

    //Tiburon, en esta posicion para que este debajo de los diamantes y el caballo
    this.tiburon = game.add.sprite(500, 20, "tiburon");

    //Medusa
    this.medusa = game.add.sprite(950, 60, "medusa");

    //Peces
    this.peces = game.add.sprite(200, 300, "peces");

    //horse
    this.horse = game.add.sprite(0, 0, "horse");
    this.horse.frame = 0;
    this.horse.x = game.width / 2;
    this.horse.y = game.height / 2;
    this.horse.anchor.setTo(0.5, 0.5);
    // this.horse.angle = 90; rotar caballo
    // this.horse.scale.setTo(2,2); escalar caballo en tamaño
    // this.horse.alpha = 0.5; transparencia del caballo

    //diamantes
    //game.add.sprite(0,0,'diamonds')
    this.diamonds = [];
    for (let index = 0; index < Cant_Diamantes; index++) {
      let diamond = game.add.sprite(100, 100, "diamonds");
      diamond.frame = game.rnd.integerInRange(0, 1);
      diamond.scale.setTo(0.3 + game.rnd.frac());
      diamond.anchor.setTo(0.5);
      diamond.x = game.rnd.integerInRange(50, 1050);
      diamond.y = game.rnd.integerInRange(50, 600);

      //evitar que los diamantes se sobrepongan
      this.diamonds[index] = diamond;
      let rectCurrentDiamond = this.getBoundsDiamond(diamond);
      let rectHorse = this.getBoundsDiamond(this.horse);
      while (
        this.isOverlapingOtherDiamond(index, rectCurrentDiamond) ||
        this.isRectanglesOverlapping(rectHorse, rectCurrentDiamond)
      ) {
        diamond.x = game.rnd.integerInRange(50, 1050);
        diamond.y = game.rnd.integerInRange(50, 600);
        rectCurrentDiamond = this.getBoundsDiamond(diamond);
      }
    }

    //en la pantalla, se ejecuta la funcion que marcara el flagFirstMouseDown,
    //con estado true, para que se mueva el caballo
    game.input.onDown.add(this.onTap, this);

    //integrar y ver png de explosion cargada (dePrueba)
    //this.explosion = game.add.sprite(100, 100, "explosion");
    // let tween = game.add.tween(this.explosion);
    // revisar lets-gamedev.de/phasereasings para ver mas Phaser.Easing o movimientos
    // tween.to({ x: 500, y: 100 }, 1500, Phaser.Easing.Exponential.Out);
    // tween.start();

    //integrar y ver png de explosion cargada (forma1)
    // this.explosion = game.add.sprite(100, 100, "explosion");

    //crear grupos, para luego a ese grupo agregarle animaciones u otras cosas.add() (forma2, la mejor)
    this.explosionGroup = game.add.group();

    for (let index = 0; index < 10; index++) {
      this.explosion = this.explosionGroup.create(100, 100, "explosion");

      this.explosion.tweenScale = game.add.tween(this.explosion.scale).to(
        {
          x: [0.4, 0.8, 0.4],
          y: [0.4, 0.8, 0.4],
        },
        600,
        Phaser.Easing.Exponential.Out,
        false,
        0,
        0,
        false
      );
      this.explosion.tweenAlpha = game.add.tween(this.explosion).to(
        {
          alpha: [1, 0.6, 0],
        },
        600,
        Phaser.Easing.Exponential.Out,
        false,
        0,
        0,
        false
      );
      this.explosion.anchor.setTo(0.5);
      this.explosion.kill();
    }

    // crear estilos para textos
    let style = {
      font: "bold 30pt Arial",
      fill: "#FFFFFF",
      align: "center",
    };

    //Crear textos
    this.scoreText = game.add.text(game.width / 2, 40, "0", style);

    //puntaje actual
    this.currentScore = 0;

    //centrar texto
    this.scoreText.anchor.setTo(0.5);

    //////////////Timer - Tiempo del Juego
    this.totalTime = 30;
    this.timerText = game.add.text(1050, 40, this.totalTime + "", style);
    this.timerText.anchor.setTo(0.5);

    this.timerGameOver = game.time.events.loop(
      Phaser.Timer.SECOND,
      function () {
        if (this.flagFirstMouseDown) {
          this.totalTime--;
          this.timerText.text = this.totalTime + "";
          if (this.totalTime <= 0) {
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage("Juego Terminado");
          }
        }
        console.log("afuer");
      },
      this
    );
  },
  //phaser frame a frame ejecutara este metodo
  update: function () {
    if (this.flagFirstMouseDown && !this.endGame) {
      for (let index = 0; index < Cant_burbujas; index++) {
        let burbuja = this.burbujasArray[index];
        burbuja.y -= burbuja.vel;
        if (burbuja.y < -50) {
          //se resetea la posicion de cada burbuja con estas corrdenadas en x e y
          burbuja.y = 700;
          burbuja.x = game.rnd.integerInRange(1, 1140);
        }
      }

      //movimiento del tiburon
      this.tiburon.x--;
      if (this.tiburon.x < -300) {
        this.tiburon.x = 1300;
      }

      //movimiento de los peces
      this.peces.x += 0.3;
      if (this.peces.x > 1200) {
        this.peces.x = -300;
      }

      // this.horse.angle+=1; rotar automaticamente el caballo
      let pointerX = game.input.x;
      let pointerY = game.input.y;
      // console.log('x:' + pointerX + '----' + 'y:' + pointerY );
      //se calcula la distancia entre el puntero y la del caballo
      let distX = pointerX - this.horse.x;
      let distY = pointerY - this.horse.y;

      //si la distancia es positiva mira hacia la derecha, de lo contrario, a la izquierda
      if (distX > 0) {
        this.horse.scale.setTo(1, 1);
      } else {
        this.horse.scale.setTo(-1, 1);
      }

      //caballo sigue al puntero del mause
      this.horse.x += distX * 0.06;
      this.horse.y += distY * 0.06;

      //colision entre diamantes y el caballo
      for (let index = 0; index < Cant_Diamantes; index++) {
        let rectHorse = this.getBoundsHorse();
        let rectDiamond = this.getBoundsDiamond(this.diamonds[index]);
        if (
          this.diamonds[index].visible &&
          this.isRectanglesOverlapping(rectHorse, rectDiamond)
        ) {
          //funcion para incrementar puntaje al colisionar
          this.increaseScore();
          //los diamantes desaparecen cuando se COLISIONAN
          this.diamonds[index].visible = false;

          let explosion = this.explosionGroup.getFirstDead();
          if (explosion != null) {
            this.explosion.reset(
              this.diamonds[index].x,
              this.diamonds[index].y
            );

            this.explosion.tweenScale.start();
            this.explosion.tweenAlpha.start();

            explosion.tweenAlpha.onComplete.add(function (
              currentTarget,
              currentTween
            ) {
              currentTarget.kill();
            },
            this);
          }
        }
      }

      //cambiar estado
      if (this.cuentaSonrisa >= 0) {
        this.cuentaSonrisa++;
        if (this.cuentaSonrisa > 50) {
          this.cuentaSonrisa = -1;
          this.horse.frame = 0;
        }
      }
    }
  },
  // metodos usados en el create
  onTap: function () {
    if (!this.flagFirstMouseDown) {
      this.tweenMedusa = game.add
        .tween(this.medusa.position)
        .to({ y: -0.001 }, 5800, Phaser.Easing.Cubic.InOut, true, 0, 1000, true)
        .loop(true);
    }

    this.flagFirstMouseDown = true;
  },
  // calcular y asociar un bodyblock a los diamantes
  getBoundsDiamond: function (currentDiamond) {
    return new Phaser.Rectangle(
      currentDiamond.left,
      currentDiamond.top,
      currentDiamond.width,
      currentDiamond.height
    );
  },
  // calcular si el bodyblock del rectangulo 1, esta ocupando la posicion y/espacio del 2do, si es asi retorna true.
  isRectanglesOverlapping: function (rect1, rect2) {
    if (rect1.x > rect2.x + rect2.width || rect2.x > rect1.x + rect1.width) {
      return false;
    }
    if (rect1.y > rect2.y + rect2.height || rect2.y > rect1.y + rect1.height) {
      return false;
    }
    return true;
  },
  isOverlapingOtherDiamond: function (index, rect2) {
    for (let i = 0; i < index; i++) {
      let rect1 = this.getBoundsDiamond(this.diamonds[i]);
      if (this.isRectanglesOverlapping(rect1, rect2)) {
        return true;
      }
    }
    return false;
  },
  //obtener el bodyblock del solo caballo
  getBoundsHorse: function () {
    let x0 = this.horse.x - Math.abs(this.horse.width) / 4;
    let width = Math.abs(this.horse.width) / 2;
    let y0 = this.horse.y - this.horse.height / 2;
    let height = this.horse.height;
    return new Phaser.Rectangle(x0, y0, width, height);
  },
  render: function () {
    // Mostrar BodyBlock del Caballo
    // game.debug.spriteBounds(this.horse);
    //
    //Mostrar bodyblock de los diamantes
    // for (let index = 0; index < Cant_Diamantes; index++) {
    //   game.debug.spriteBounds(this.diamonds[index]);
    // }
    //mostrar informacion de la musica cargada
    // game.debug.soundInfo(musica, 20, 32);
  },
  //metodo para incrementar el puntaje al haber una colision con un diamante
  increaseScore: function () {
    //cambiar contador de sonrisa del cabballo al tomar un diamante
    this.cuentaSonrisa = 0;
    this.horse.frame = 1;

    //sumar 100 puntos al tomar un diamante
    this.currentScore += 100;
    this.scoreText.text = this.currentScore;

    this.amountDiamondsCaught += 1;
    if (this.amountDiamondsCaught >= Cant_Diamantes) {
      //al ganar el juego se ejecuta tal codigo
      game.time.events.remove(this.timerGameOver);
      this.endGame = true;
      this.showFinalMessage("Felicidades");
    }
  },
  //mensaje final al ganar o perder en el juego
  showFinalMessage: function (msg) {
    //detener movimiento de medusa
    this.tweenMedusa.stop();
    //creacion de cuadro de finalizacion del juego
    let bgAlpha = game.add.bitmapData(game.width, game.height);
    bgAlpha.ctx.fillStyle = "#000000";
    bgAlpha.ctx.fillRect(0, 0, game.width, game.height);
    let bg = game.add.sprite(0, 0, bgAlpha);
    bg.alpha = 0.5;

    // crear estilos para textos
    let style = {
      font: "bold 60pt Arial",
      fill: "#FFFFFF",
      align: "center",
    };

    this.textFieldFinalMsg = game.add.text(
      game.width / 2,
      game.height / 2,
      msg,
      style
    );
    this.textFieldFinalMsg.anchor.setTo(0.5);
  },
};

//#1 creamos la variable 'game' para guardar la instancia que vamos a crear de nuestro juego
//Phaser.Game(a,b,c) a= resolucion x de la imagen, b= resolucion y de la imagen, c=Render a usar para el juego
//Phaser.Canvas= mas lento, en caso de no contar con una gpu
//Phaser.WebGL= mas rapido, pero en uso de una gpu
//Phaser.Auto= phaser decide cual usar
var game = new Phaser.Game(1136, 640, Phaser.Canvas);

// #2 se crea y añade el estado a la variable game, guardando en 'gameplay' el estado hecho en tal metodo
game.state.add("gameplay", GamePlayManager);

// #3 aqui se menciona con cual estado comenzar, un juego puede tener varios estados.
game.state.start("gameplay");

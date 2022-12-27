function novoElemento(tagName, className){
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')
    
    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }  

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`;
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaço, notificarPonto){
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaço),
        new ParDeBarreiras(altura, abertura, largura + espaço * 2),
        new ParDeBarreiras(altura, abertura, largura + espaço * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            if (par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaço * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            
            cruzouOMeio && notificarPonto()
        })
    }
}

function Passaro(alturaJogo){
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px'[0]))
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0){this.setY(0)} // detectar colisão
        else if (novoY >= alturaMaxima){this.setY(alturaMaxima)}
        else{this.setY(novoY)}
    }

    this.setY(alturaJogo / 2)
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect() // Retangulo associado ao elemento A
    const b = elementoB.getBoundingClientRect() // Retangulo associado ao elemento B

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function gameOver(areaDoJogo, pontos){
    this.elemento = novoElemento('div', 'gameOver')

    document.querySelector('.progresso').classList.add('pontuacaoFinal')
    document.querySelector('.pontuacaoFinal').classList.remove('progresso')
    let pontuacaoFinal = document.querySelector('.pontuacaoFinal')
    pontuacaoFinal.innerHTML = `Score: ${pontos}`;

    this.elementoRecord = novoElemento('span', 'record')
    let record = window.localStorage.getItem('record');
    this.elementoRecord.innerHTML = `Best: ${record}`;
    areaDoJogo.appendChild(this.elementoRecord)


    this.elementoP = novoElemento('p', 'gameOverP')   
    this.elementoP.innerHTML = "GAME OVER <br>"

    this.elementoRestart = novoElemento('button', 'gameOverButton')  
    this.elementoRestart.innerHTML = "START AGAIN" 
    this.elementoRestart.onclick = recarregarAPagina()

    this.elemento.appendChild(this.elementoP)
    this.elementoP.appendChild(this.elementoRestart)
    areaDoJogo.appendChild(this.elemento)
}

function recarregarAPagina(){
    elementoRestart.addEventListener("click", function() {
        location.reload();
    });
} 

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(passaro.elemento)
    areaDoJogo.appendChild(progresso.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(colidiu(passaro, barreiras)){
                clearInterval(temporizador)
                let pontos = progresso.elemento.innerHTML
                Record(pontos)
 
                gameOver(areaDoJogo, pontos)
            }
        }, 20)
    }    
}

function Record(pontos){    
    let record = window.localStorage.getItem('record');
    let progresso = parseInt(pontos)
    
    if (progresso >= record){
        let record = progresso
        window.localStorage.setItem('record', record);
    }
}


new FlappyBird().start()   
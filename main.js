const cam = document.querySelector('#video')
const btnProx = document.querySelector('#btn-prox')

Promise.all([ // Retorna apenas uma promisse quando todas já estiverem resolvidas

    faceapi.nets.tinyFaceDetector.loadFromUri('/models'), // É igual uma detecção facial normal, porém menor e mais rapido
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'), // Pegar os pontos de referencia do sue rosto. Ex: olhos, boca, nariz, etc...
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'), // Vai permitir a api saber onde o rosto está localizado no video
    faceapi.nets.faceExpressionNet.loadFromUri('/models') // Vai permitir a api saber suas expressões. Ex: se esta feliz, triste, com raiva, etc...

]).then(startVideo)

async function startVideo() {
    const constraints = { video: true };

    try {
        let stream = await navigator.mediaDevices.getUserMedia(constraints);

        cam.srcObject = stream;
        cam.onloadedmetadata = e => {
            cam.play();
        }

    } catch (err) {
        console.error(err);
    }
}

cam.addEventListener('play', () => {

    const canvas = faceapi.createCanvasFromMedia(video) // Criando canvas para mostrar nossos resultador
    document.body.append(canvas) // Adicionando canvas ao body
    canvas.style.marginBottom = '190px'

    const displaySize = { width: 720, height: 480 } // criando tamanho do display a partir das dimenssões da nossa cam

    faceapi.matchDimensions(canvas, displaySize) // Igualando as dimensões do canvas com da nossa cam

    let tics = setInterval(detectionAPI, 1000);

    btnProx.addEventListener('click', e => { 
        tics = setInterval(detectionAPI, 1000);
    })

    async function detectionAPI() {

        btnProx.setAttribute('hidden', 'hidden')

        const detections = await faceapi.detectAllFaces(
            cam, // Primeiro parametro é nossa camera
            new faceapi.TinyFaceDetectorOptions() // Qual tipo de biblioteca vamos usar para detectar os rostos

        )
            .withFaceLandmarks() // Vai desenhar os pontos de marcação no rosto
            .withFaceExpressions() // Vai determinar nossas expressões


        const resizedDetections = faceapi.resizeResults(detections, displaySize) // Redimensionado as detecções


        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height) // Apagando nosso canvas antes de desenhar outro

        faceapi.draw.drawDetections(canvas, resizedDetections) // Desenhando decções
        //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections) // Desenhando os pontos de referencia
        //faceapi.draw.drawFaceExpressions(canvas, resizedDetections) // Desenhando expressões

        console.log(detections[0].detection._score)

        const __score = detections[0].detection._score

        if (__score >= 0.90) {
            console.log('é um rosto humano!')
            stopExec(tics)
            makeAccounts()

            btnProx.removeAttribute('hidden')
        }

    }



    

    function stopExec(interval) {
        clearInterval(interval)
    }

    function makeAccounts(){
        let accounts = localStorage.getItem('amount')

        accounts = parseInt(accounts)

        if (accounts){
            accounts += 1
            localStorage.setItem('amount', accounts)
        } else {
            localStorage.setItem('amount', 1)
        }
    }

})
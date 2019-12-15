// myapp.js
var stats;
var timer;
var manifestUri = 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';
// var manifestUri = 'https://yt-dash-mse-test.commondatastorage.googleapis.com/media/car-20120827-manifest.mpd';

// if disabled, you can choose variants using player.selectVariantTrack(track: Variant, clearBuffer: boolean)
const enableABR = true

const evaluator = {
	currentTrack: false,
	evaluate: () => {},
}

const { Logger } = require('./src/logger');
const { Event } = require('./src/event');
const { CredentialManager } = require('./src/credential');

const email = 'thailsson.clementino@icomp.ufam.edu.br';
const password = '1thailsson2';
let logger;
let econtrols;
let emedia;
let curBandwidth = -1;


//Aqui para autenticar
CredentialManager.login(email, password).then(({ token })=>{
	logger = new Logger(email, token);
	econtrols = new Event();
	emedia = new Event();
	}
);
let trackQAtual = 0

// Adaptation Strategy
evaluator.evaluate = (tracks,currentBandwidth) => {
	// if first select the lower variant
    if(curBandwidth == -1) {
        curBandwidth = currentBandwidth;
    }
    curBandwidth = 0.75*curBandwidth + 0.25*currentBandwidth;
    console.log(tracks[0]['bandwidth'])
    var esc = 0;
    for(var i = 0; i < tracks.length; i++) {
        if(tracks[i]['bandwidth']*1.3 > curBandwidth) break;
        esc = i;
    }
    console.log('Curbanda = ',curBandwidth);
    console.log('Video escolhido tem banda ',tracks[esc]['bandwidth'])

	selected = tracks[esc]
    return selected;
}

function initApp() {
    // Install built-in polyfills to patch browser incompatibilities.
    shaka.polyfill.installAll();

    // Check to see if the browser supports the basic APIs Shaka needs.
    if (shaka.Player.isBrowserSupported()) {
        // Everything looks good!
        initPlayer();
    } else {
        // This browser does not have the minimum set of APIs we need.
        console.error('Browser not supported!');
    }
}

function initPlayer() {
    // Create a Player instance.
    var video = document.getElementById('video');
    var player = new shaka.Player(video);

    // Attach player to the window to make it easy to access in the JS console.
    window.player = player;
    // Attach evaluator to player to manage useful variables
    player.evaluator = evaluator;


    // create a timer
    timer = new shaka.util.Timer(onTimeCollectStats)
    //stats = new shaka.util.Stats(video)


    video.addEventListener('ended', onPlayerEndedEvent)
    video.addEventListener('play', onPlayerPlayEvent)
    video.addEventListener('pause', onPlayerPauseEvent)
    video.addEventListener('progress', onPlayerProgressEvent)

    // // Listen for error events.
    player.addEventListener('error', onErrorEvent);
    // player.addEventListener('onstatechange',onStateChangeEvent);
    // player.addEventListener('buffering', onBufferingEvent);

    // configure player: see https://github.com/google/shaka-player/blob/master/docs/tutorials/config.md
    player.configure({
        abr: {
            enabled: enableABR,
            switchInterval: 1,
        }
    })

    /**
     * Our SimplesAbrManager.prototype.chooseVariant code
     * @override
     */

    shaka.abr.SimpleAbrManager.prototype.chooseVariant = function() {
        this.enabled_ = true;
        console.error('Choosing variants...');
        // get variants list and sort down to up
        var tracks =  this.variants_.sort((t1, t2) => t1.video.height - t2.video.height)

        let currentBandwidth = this.bandwidthEstimator_.getBandwidthEstimate(
            this.config_.defaultBandwidthEstimate); //banda atual.

        console.log('Banda ???? ',currentBandwidth);

        //console.log('tracks: ', this.variants_)
        const selectedTrack = evaluator.evaluate(tracks,currentBandwidth)


        /* BUFFEEEEEEEEEEEEEEERRR */
        //console.warn(video.buffered);
        if(video.buffered.length > 0)
            console.warn('Buffer range', video.buffered.start(0), video.buffered.end(0));


        evaluator.currentTrack = selectedTrack

        //console.log('options: ', tracks)
        console.log('selected: ', evaluator.currentTrack.video.height);
        this.lastTimeChosenMs_ = Date.now();
        return evaluator.currentTrack;
    }

    // Try to load a manifest.
    // This is an asynchronous process.
    player.load(manifestUri).then(function() {
        // This runs if the asynchronous load is successful.
        console.log('The video has now been loaded!');

    }).catch(onError);  // onError is executed if the asynchronous load fails.
}

function onPlayerEndedEvent(ended) {
    console.log('Video playback ended', ended);
    if(logger){
        logger.info('Apenas informando', {}); //(MENSAGEM,{} QUALQUER COISA)
        //VERIFICAR LOGGER.TS PARA VER OS MÉTODOS E TAL.
    }
    timer.stop();
}

function onPlayerPlayEvent(play){
    console.log('Video play hit');
}

function onPlayerPauseEvent(pause){
    //econtrols.push('pause', 1.0)
    //logger.info('pause', {})
    console.log('Video pause hit');
}

function onPlayerProgressEvent(event) {
    console.log('Progress Event: ', event);
}

function onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
}

function onError(error) {
    // Log the error.
    console.error('Error code', error.code, 'object', error);
}

function onStateChangeEvent(state){
    console.log('State Change', state)
    if (state['state'] == "load"){
        timer.tickEvery(10);
    }
}

function onTimeCollectStats(){
    console.log('timer is ticking');
    console.log('switchings over last 10s',stats.getSwitchHistory());
}

function onBufferingEvent(buffering){
    bufferingEvent(buffering);
}

function bufferingEvent(buffering){
    console.log("Buffering: ", buffering);
}


document.addEventListener('DOMContentLoaded', initApp);

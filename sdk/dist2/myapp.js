// myapp.js
var f = true;
var qualidades = [];
var stalls = [];
var stats;
var timer;

videos = [
	'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
	'http://rdmedia.bbc.co.uk/dash/ondemand/elephants_dream/1/client_manifest-all.mpd'
]

contentID = 0;

var manifestUri = videos[contentID];
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
const password = '1thailsson.clementino2';
let logger;
let events;
let curBandwidth = -1;


//Aqui para autenticar
CredentialManager.login(email, password).then(({ token })=>{
	logger = new Logger(email, token);
	infos = new Event();
	infos.set('ContentID',contentID);
	infos.set('TechID',0);
	logger.info('Informações:', infos.dump());
	events = new Event();
	console.log("Login Realizado!");
}).catch( error => {
	console.log("Erro ao logar");
	throw error;
});


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

		selected = tracks[esc];
		events.push('qualidade',esc);
		qualidades.push(esc);
		events.push('bandwidth',currentBandwidth);

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
		inicio = new Date();

    // create a timer
    timer = new shaka.util.Timer(onTimeCollectStats)
    //stats = new shaka.util.Stats(video)
		console.log('timer:' , timer)
    video.addEventListener('ended', onPlayerEndedEvent)
    video.addEventListener('play', onPlayerPlayEvent)
    video.addEventListener('pause', onPlayerPauseEvent)
    video.addEventListener('progress', onPlayerProgressEvent)
		video.onwaiting = function(stall){
												console.error('Video stalled.', stall);
												stalls.push(video.currentTime)
												if(events){
													events.push('Stall',video.currentTime)
												}
											};

    // // Listen for error events.
    player.addEventListener('error', onErrorEvent);

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

        console.log('Banda == ',currentBandwidth);

        //console.log('tracks: ', this.variants_)
        const selectedTrack = evaluator.evaluate(tracks,currentBandwidth)


        /* BUFFEEEEEEEEEEEEEEERRR */
        //console.warn(video.buffered);
        if(video.buffered.length > 0)
            console.warn('Buffer range', video.buffered.start(0), video.buffered.end(0));


        evaluator.currentTrack = selectedTrack

        //console.log('options: ', tracks)
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
		console.warn("Tempos em que aconteceram stalls:",stalls);
		console.warn("Histórico de qualidades:",qualidades);

		if(logger){
				events.push('ended',video.currentTime);
        logger.info('Eventos:', events.dump());
				console.error("Logs Enviados!!!");
    }else{
				console.error("Log não foram enviados!!!");
		}

    timer.stop();
}

function onPlayerPlayEvent(play){
    console.log('Video play hit');
		events.push("play",video.currentTime);
}

function onPlayerPauseEvent(pause){
    events.push('pause',video.currentTime);
    console.log('Video pause hit');
}

function onPlayerProgressEvent(event) {
		fim = new Date();
		if(f){
			events.push('SDelay',(fim.getTime() - inicio.getTime())/1000);
			console.warn('SDelay:',(fim.getTime() - inicio.getTime())/1000);
			f = false;
		}
		events.push('progress',video.currentTime)
    //console.log('Progress Event:', event);
}

function onErrorEvent(event) {
    // Extract the shaka.util.Error object from the event.
    onError(event.detail);
		events.push('Error', event);
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

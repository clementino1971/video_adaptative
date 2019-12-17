(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.environment = {
    //Alterar a URL para a api
    log: { url: 'http://localhost:3000' }
};

},{}],2:[function(require,module,exports){
// myapp.js
var f = true;
var bandas = [];
var qualidades = [];
var stalls = [];
var stats;
var timer;

videos = [
	'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
	'http://rdmedia.bbc.co.uk/dash/ondemand/elephants_dream/1/client_manifest-all.mpd'
]

contentID = 1;

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
	infos.set('TechID',1);
	logger.info('Informacoes:', infos.dump());
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
		if(events){
			events.push('qualidade',esc);
			events.push('bandwidth',currentBandwidth);
			bandas.push(currentBandwidth);
			events.push('BSwitch',tracks[esc]['bandwidth']);
		}

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
		//console.log('timer:' , timer)
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

//Função para calcular o desvio padrão e a média da Banda;
function stts(){
	var sum = 0;
	for(var i=0;i<bandas.length;i++){
		sum += bandas[i];
	}

	Bmedia = sum/bandas.length;

	sum = 0;
	for(var i=0;i<bandas.length;i++){
		sum += Math.pow(Bmedia - bandas[i],2);
	}

	BdesvioPadrao = Math.sqrt(sum/(bandas.length -1));

	events.push('statistic',Bmedia);
	events.push('statistic',BdesvioPadrao);
}

function onPlayerEndedEvent(ended) {
    console.log('Video playback ended', ended);
		console.warn("Tempos em que aconteceram stalls:",stalls);
		console.warn("Histórico de qualidades:",qualidades);

		if(logger){
				stts();
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
		if(events){
			if(f){
				events.push('SDelay',(fim.getTime() - inicio.getTime())/1000);
				console.warn('SDelay:',(fim.getTime() - inicio.getTime())/1000);
				f = false;
			}
			events.push('progress',video.currentTime);
		}
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

},{"./src/credential":3,"./src/event":4,"./src/logger":5}],3:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var environment_1 = require("../common/environment");
var node_fetch_1 = require("node-fetch");
var CredentialManager = /** @class */ (function () {
    function CredentialManager() {
    }
    Object.defineProperty(CredentialManager.prototype, "token", {
        get: function () { return this._token; },
        set: function (token) { this._token = token; },
        enumerable: true,
        configurable: true
    });
    CredentialManager.login = function (email, password) {
        var body = {
            'email': email,
            'password': password
        };
        return new Promise(function (resolve, reject) {
            node_fetch_1["default"](environment_1.environment.log.url + '/users/authenticate', {
                headers: { "Content-Type": "application/json; charset=utf-8" },
                method: 'POST',
                body: JSON.stringify(body)
            })
                .then(function (response) { return response.json(); })
                .then(function (json) {
                console.warn(json['accessToken']);
                var credential = new CredentialManager();
                credential._token = json['accessToken'];
                resolve(credential);
            })["catch"](function (error) {
                reject(error);
            });
        });
    };
    return CredentialManager;
}());
exports.CredentialManager = CredentialManager;

},{"../common/environment":1,"node-fetch":6}],4:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var Event = /** @class */ (function () {
    function Event() {
        this.logs = new Map();
        //    this.logs = new Object()
    }
    Event.prototype.set = function (key, records) {
        this.logs.set(key, records);
    };
    Event.prototype.setS = function (key, records) {
        this.logs.set(key, records);
    };
    Event.prototype.get = function (key) {
        return this.logs.get(key);
    };
    Event.prototype.push = function (key, value) {
        var records = this.logs.get(key);
        if (records !== undefined) {
            records.push(value);
        }
        else {
            this.logs.set(key, [value]);
        }
    };
    Event.prototype.dump = function () {
        return this.logs;
    };
    return Event;
}());
exports.Event = Event;

},{}],5:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var environment_1 = require("../common/environment");
var node_fetch_1 = require("node-fetch");
var Logger = /** @class */ (function () {
    function Logger(userId, sessionId) {
        this.userId = userId;
        this.sessionId = sessionId;
    }
    Logger.prototype.debug = function (primaryMessage) {
        var supportingData = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            supportingData[_i - 1] = arguments[_i];
        }
        this.emitLogMessage("debug", primaryMessage, supportingData);
    };
    Logger.prototype.warn = function (primaryMessage) {
        var supportingData = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            supportingData[_i - 1] = arguments[_i];
        }
        this.emitLogMessage("warn", primaryMessage, supportingData);
    };
    Logger.prototype.error = function (primaryMessage) {
        var supportingData = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            supportingData[_i - 1] = arguments[_i];
        }
        this.emitLogMessage("error", primaryMessage, supportingData);
    };
    Logger.prototype.info = function (primaryMessage) {
        var supportingData = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            supportingData[_i - 1] = arguments[_i];
        }
        this.emitLogMessage("info", primaryMessage, supportingData);
    };
    Logger.prototype.emitLogMessage = function (msgType, msg, supportingDetails) {
        var mapa = supportingDetails[0];
        var iterador = mapa.entries();
        var obj = {};
        var aux = iterador.next().value;
        while (aux !== undefined) {
            obj[aux[0]] = aux[1];
            aux = iterador.next().value;
        }
        var body = { 'msgType': msgType,
            'msg': msg,
            'userId': this.userId,
            'sessionId': this.sessionId,
            'log': obj
        };
        console.warn('Sending...', body);
        console.log(JSON.stringify(body));
        node_fetch_1["default"](environment_1.environment.log.url + '/events', {
            headers: { "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Bearer " + this.sessionId
            },
            method: 'POST',
            body: JSON.stringify(body)
        }).then(function (response) { return response.json(); })
            .then(function (json) { return console.log(json); })["catch"](function (error) {
        });
    };
    return Logger;
}());
exports.Logger = Logger;

},{"../common/environment":1,"node-fetch":6}],6:[function(require,module,exports){
(function (global){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
exports.default = global.fetch.bind(global);

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[2]);

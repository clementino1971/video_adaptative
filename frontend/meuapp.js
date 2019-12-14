(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.environment = {
    //Alterar a URL para a api
    log: { url: 'http://localhost:3000' }
};

},{}],2:[function(require,module,exports){
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


//Aqui para autenticar
CredentialManager.login(email, password).then(({ token })=>{
	logger = new Logger(email, token);
	econtrols = new Event();
	emedia = new Event();
	}
);
let trackQAtual = 0

// Adaptation Strategy
evaluator.evaluate = (tracks) => {
	// if first select the lower variant
	selected = tracks[0]

	/*
	 * Insert here you adaptation strategy
	 */

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
		const selectedTrack = evaluator.evaluate(tracks)


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
        console.log("Já tá aqui brabo");
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
                console.log(json['accessToken']);
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
    Event.prototype.get = function (key) {
        return this.logs.get(key);
    };
    Event.prototype.push = function (key, value) {
        var isExist = key in this.logs;
        if (isExist) {
            var records = this.logs.get(key);
            if (records !== undefined)
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
        var body = { 'msgType': msgType,
            'msg': msg,
            'userId': this.userId,
            'sessionId': this.sessionId,
            'log': supportingDetails[0]
        };
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

'use strict';

const _PLAYER = $('#bgndVideo');
const _BTN_LOOP = $('#btn-loop');
const _BTN_PLAY_PAUSE = $('#btn-play-pause');
const _BTN_STOP = $('#btn-stop');
const _BTN_CONTROLS = $('#btn-menu');
const _BTN_CHANGE_VIDEO = $('#btn-change');

const _CONTROLS = $('#controls');

let PLAYER;
let IS_PLAYING = false;
let IS_CONTROLS_OPEN = true;
let CONTROLS_WIDTH = _CONTROLS.width();

/*
==== CONFIGURATIN
 */

const CFG_PLAYER_LOOP = "player.loop";
const CFG_VIDEO_LAST = "video.last";

function getVideoConfig(videoURL) {
    return {
        videoURL: videoURL,
        containment: 'body',
        opacity: 1,
        mute: false,
        useOnMobile: true,
        ratio: '16/9',
        quality: 'auto',
        vol: 20,
        showControls: false,
        startAt: 0,
        //autoPlay: true,
        showAnnotations: false,
        cc_load_policy: false,
        showYTLogo: false,
        stopMovieOnBlur: false,
        loop: false
    }
}

function configGet(key, default_value) {
    let r = JSON.parse(localStorage.getItem(key));
    if (!r)
        return default_value;

    return r;
}

function configPut(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/*
==== PLAYER
 */
function playerInit() {
    PLAYER = _PLAYER.YTPlayer(getVideoConfig(configGet(CFG_VIDEO_LAST, '7C9EYka6fIU')));
    playerPlay();
}

function playerPlay() {
    PLAYER.YTPPlay();
    IS_PLAYING = true;
    updatePlaying();
}

function playerPause() {
    PLAYER.YTPPause();
    IS_PLAYING = false;
    updatePlaying();
}

function playerStop() {
    PLAYER.YTPStop();
    IS_PLAYING = false;
    updatePlaying();
}

function playerChangeVideo(videoID) {
    PLAYER.YTPChangeMovie(getVideoConfig(videoID));
    configPut(CFG_VIDEO_LAST, videoID);
}

function playerLoop(isLooping) {
    configPut(CFG_PLAYER_LOOP, isLooping);

    if (isLooping) {
        _BTN_LOOP.addClass('btn-info');
    } else {
        _BTN_LOOP.removeClass('btn-info');
    }
}

function isLooping() {
    return configGet(CFG_PLAYER_LOOP);
}

function playerBlur(status) {
    if (status) {
        PLAYER.YTPApplyFilter('blur', 50);
    } else {
        PLAYER.YTPRemoveFilter('blur')
    }
}

/*
==== CONTROLS
 */
function initializeControls() {
    // controls handle
    _BTN_CONTROLS.on('click', () => {
        controlsVisibility();
    });

    // hide the controls
    controlsVisibility();

    // LOOP
    playerLoop(configGet(CFG_PLAYER_LOOP, false));
    _BTN_LOOP.on('click', () => {
        playerLoop(!isLooping());
    });

    // PLAY PAUSE
    _BTN_PLAY_PAUSE.on('click', () => {
        if (!IS_PLAYING) {
            playerPlay();
        } else {
            playerPause();
        }
    });

    // STOP
    _BTN_STOP.on('click', () => {
        playerStop();
    });

    // CHANGE VIDEO
    _BTN_CHANGE_VIDEO.on('click', () => {

        playerBlur(true);
        swal({
            title: 'Change Video',
            text: 'Paste a Youtube URL or video ID',
            content: 'input',
            buttons: true
        })
            .then((videoID) => {
                playerChangeVideo(videoID);
                playerBlur(false);
            })
            .catch(() => {
                playerBlur(false);
            });

    });
}

function controlsVisibility() {
    if (IS_CONTROLS_OPEN) {
        _CONTROLS.animate({
            width: 0
        }, 350);
    } else {
        _CONTROLS.animate({
            width: CONTROLS_WIDTH
        }, 350);
    }

    IS_CONTROLS_OPEN = !IS_CONTROLS_OPEN;
}

function updatePlaying() {
    if (IS_PLAYING) {
        _BTN_PLAY_PAUSE.html('<i class="fa fa-fw fa-pause"></i>');
    } else {
        _BTN_PLAY_PAUSE.html('<i class="fa fa-fw fa-play"></i>');
    }
}

$(() => {
    playerInit();
    initializeControls();

    PLAYER.on('YTPEnd', () => {
        if (isLooping()) {
            PLAYER.YTPPlay();
        }
    });
});
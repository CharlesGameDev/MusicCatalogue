const playButton = document.getElementById("play_button");
const loopButton = document.getElementById("loop_button");
const songCount = document.getElementById("song-count");
const currentTime = document.getElementById("current-time-text");
const currentSong = document.getElementById("current-song");
const timeSlider = document.getElementById("current-time");
const volumeSlider = document.getElementById("volume");
const songList = document.getElementById("song-list");
const audio = document.getElementById("audio");

let playing = false;
let canPlay = false;
let loop = false;

if (getCookie("volume") == "") {
    setCookie("volume", 50);
}
volumeSlider.value = getCookie("volume");
audio.volume = volumeSlider.value / 100;

function create_song_list(list) {
    list.forEach(song => {
        song = song.split("_");
        console.log(song);
        const html = `
        <span class="song-button" onclick="set_music(['${song[0]}','${song[1]}'])">${song[0].replace("\\", "")}</span>
        <span class="song-button-date">${song[1]}</span>
        <br>`;
        console.log(html);
        songList.innerHTML += html;
    });
    songCount.innerText = `${list.length} ${list.length == 1 ? "song" : "songs"}`;
}

document.addEventListener("keydown", function(e) {
    switch (e.key) {
        case " ":
            toggle_music();
            break;
        case "l":
        case "L":
            toggle_loop();
            break;
    }
})

timeSlider.addEventListener("change", function(e) {
    audio.currentTime = timeSlider.value;
})

volumeSlider.addEventListener("change", function(e) {
    audio.volume = volumeSlider.value / 100;
    setCookie("volume", volumeSlider.value);
})

audio.addEventListener("timeupdate", function(e) {
    const seconds = audio.currentTime;
    timeSlider.value = seconds;

    const time = get_time_text(seconds);
    const duration = get_time_text(audio.duration);
    currentTime.innerText = `${time} / ${duration} - `;
});

audio.addEventListener("ended", function(e) {
    if (loop) {
        audio.currentTime = 0;
        audio.play();
    } else {
        playing = false;
        update_play_button();
    }
})

function get_time_text(totalSeconds) {
    hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    minutes = Math.floor(totalSeconds / 60);
    seconds = totalSeconds % 60;
    seconds = Math.round(seconds);

    secondsText = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${secondsText}`;
}

function update_play_button() {
    playButton.innerText = playing ? "pause" : "play_arrow";
}

function set_music(music) {
    let start_on_load = playing;
    playing = false;
    canPlay = false;
    currentSong.innerText = "Loading...";

    update_play_button();
    audio.src = `${music[0]}.wav`;
    audio.load();
    audio.onloadeddata = function() {
        audio.currentTime = 0;
        timeSlider.value = 0;
        timeSlider.max = audio.duration;
        currentSong.innerHTML = music[0];
        currentSong.innerHTML += `<span class="current-song-date"> ${music[1]}</span>`;

        canPlay = true;
        if (start_on_load) {
            toggle_music();
        }
    }
}

function toggle_loop(){
    loop = !loop;

    loopButton.style.color = loop ? "lime" : "white";
}

function toggle_music() {
    if (!canPlay) return;

    playing = !playing;
    update_play_button();

    if (playing) {
        audio.play();
    } else {
        audio.pause();
    }
}
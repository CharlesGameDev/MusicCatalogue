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
let currentSongID = '';
let songIndexList = {};

if (getCookie("volume") == "") {
    setCookie("volume", 50);
}
volumeSlider.value = getCookie("volume");
audio.volume = volumeSlider.value / 100;

function create_song_list(list) {
    let i = 0;
    list.forEach(song => {
        song = song.split("_");
        songIndexList[song[0]] = i;
        const songButton = document.createElement("span");
        songButton.className = "song-button";
        songButton.id = song[0];
        songButton.innerText = song[0];

        const songButtonDate = document.createElement("span");
        songButtonDate.className = "song-button-date";
        songButtonDate.id = song[0] + "-date";
        songButtonDate.innerText = song[1];

        songList.appendChild(songButton);
        songList.innerHTML += "&nbsp;"
        songList.appendChild(songButtonDate);
        songList.innerHTML += "<br>";
        i++;
    });
    console.log(songIndexList);
    list.forEach(song => {
        song = song.split("_");
        const songButton = document.getElementById(song[0]);

        songButton.onclick = function() {
            set_music(song);
        }
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
    audio.currentTime = 0;
    if (audio.loop) {
        audio.play();
    } else {
        let nextIndex = songIndexList[currentSongID] + 1;
        if (nextIndex >= Object.keys(songIndexList).length) {
            nextIndex = 0;
        }

        const song = Object.keys(songIndexList)[nextIndex];
        const date = document.getElementById(song + "-date").innerText;

        set_music([song, date]);
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
    console.log("New song: " + music);
    let start_on_load = playing;
    playing = false;
    canPlay = false;
    currentSong.innerText = "Loading...";

    if (currentSongID != '') {
        document.getElementById(currentSongID).className = "song-button";
    }
    currentSongID = music[0];
    document.getElementById(currentSongID).className = "song-button playing";

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
    audio.loop = !audio.loop;

    loopButton.style.color = audio.loop ? "lime" : "white";
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
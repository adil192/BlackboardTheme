/// Adds a button to videos to amplify the volume

// @ts-check

(async function() {
    'use strict';

    /** @type {MediaElementAudioSourceNode | null} */
    let audioContextSource = null;
    /** @type {GainNode | null} */
    let audioContextGain = null;
    /** @type {HTMLButtonElement | null} */
    let amplifyButton = null;

    const maxGain = 10;

    function setupAudioContext() {
        if (!video) return;
        if (audioContextSource?.mediaElement === video) return;

        const audioContext = new AudioContext();
        audioContextSource = audioContext.createMediaElementSource(video);
        audioContextGain = audioContext.createGain();

        audioContextSource.connect(audioContextGain);
        audioContextGain.connect(audioContext.destination);
    }

    function addAmplifyButton() {
        /** @type {HTMLDivElement | null} */
        const volumeButton = document.querySelector('.vjs-volume-menu-button');
        if (!volumeButton) return;
        const controlBar = volumeButton.parentElement;
        if (!controlBar) return;

        /** @type {HTMLButtonElement | null} */
        amplifyButton = controlBar.querySelector('.vjs-amplify-control');
        if (!amplifyButton) {
            amplifyButton = document.createElement('button');
            amplifyButton.className = "vjs-amplify-control vjs-control vjs-button";
            amplifyButton.type = "button";
            amplifyButton.title = "Amplify volume";

            const amplifyButtonSpan = document.createElement('span');
            amplifyButtonSpan.className = "vjs-control-text";
            amplifyButtonSpan.innerText = "Amplify volume";
            amplifyButton.appendChild(amplifyButtonSpan);

            amplifyButton.setAttribute('aria-valuemin', '1');
            amplifyButton.setAttribute('aria-valuemax', `${maxGain}`);
            updateButton();
        }
        // left click
        amplifyButton.onclick = onAmplifyButtonClick;
        // right click
        amplifyButton.oncontextmenu = onAmplifyButtonRightClick;
        console.log('Amplify button:', amplifyButton);

        controlBar.insertBefore(amplifyButton, volumeButton.nextSibling);
    }

    function onAmplifyButtonClick() {
        if (!audioContextGain) return;

        let gain = Math.round(audioContextGain.gain.value);
        if (gain <= 1) gain = 2;
        else if (gain >= maxGain) gain = 1;
        else gain += 2;
        console.log('Amplifying volume to', gain);

        audioContextGain.gain.value = gain;
        updateButton();
    }

    /** @param {MouseEvent} e */
    function onAmplifyButtonRightClick(e) {
        console.log('Unamplifying volume');
        if (!audioContextGain) return;
        e.preventDefault();

        let gain = Math.round(audioContextGain.gain.value);
        if (gain <= 1) gain = maxGain;
        else if (gain == 2) gain = 1;
        else gain -= 2;
        console.log('Unamplifying volume to', gain);

        audioContextGain.gain.value = gain;
        updateButton();
    }

    function updateButton() {
        if (!amplifyButton) return;
        const gain = audioContextGain?.gain.value || 1.0;

        amplifyButton?.setAttribute('aria-valuenow', `${gain}`);
        amplifyButton?.setAttribute('aria-valuetext', `${gain}`);
    }

    /** @type {HTMLVideoElement | null} */
    let video = document.querySelector('video');
    while (!video) {
        await new Promise(resolve => setTimeout(resolve, 500));
        video = document.querySelector('video');
        console.log('Found video:', video);
    }
    console.log('Video found:', video);
    setupAudioContext();
    addAmplifyButton();
})();

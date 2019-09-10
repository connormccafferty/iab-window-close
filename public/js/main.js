// uncomment line below to register offline cache service worker 
// navigator.serviceWorker.register('../serviceworker.js');

if (typeof fin !== 'undefined') {
    init();
} else {
    document.querySelector('#of-version').innerText =
        'The fin API is not available - you are probably running in a browser.';
}

//once the DOM has loaded and the OpenFin API is ready
async function init() {
    //get a reference to the current Application.
    const app = await fin.Application.getCurrent();
    const win = await fin.Window.getCurrent();

    openDevTools();

    
    // only launch / close children from the main window
    if (win.identity.uuid === 'OpenfinPOC') {
        // launch child app
        launchChildApp();

        const closeBtn = document.querySelector('#close-windows');

        closeBtn.addEventListener('click', event => {
            event.preventDefault();
            closeChildWindows();
            let challenge = confirm('Are you sure?');
            if (challenge) {
                closeChildWindows(challenge);
                win.close(true);
            } else {
                console.log('Confirm was negative.')
            };
        })
    }

    // subscribe to close windows and listen close message from child app
    if (win.identity.uuid === 'OpenfinPOC-child') {
        fin.InterApplicationBus.subscribe({ uuid: 'OpenfinPOC' }, 'close-windows', sub_msg => {
            // do close processing here
            if (sub_msg) {
                // interval / timeout to demonstrate message being received from the main application
                let countdown = 3;
                setInterval(() => {
                    if (countdown === 3) console.log(`Closing in ${countdown}...`);
                    else console.log(`${countdown}...`);
                    countdown--;
                }, 1000);
                setTimeout(() => win.close(true), 4000);
            }
        }).then(() => console.log('Subscribed to close windows.')).catch(err => console.log(err));
    }
}

function openDevTools() {
    const { identity } = fin.Window.getCurrentSync();
    fin.System.showDeveloperTools(identity);
}

async function launchChildApp() {
    return fin.Application.startFromManifest('http://localhost:5555/child_app.json');  
}

function closeChildWindows(challenge) {
    fin.InterApplicationBus.publish('close-windows', challenge)
        .then(() => console.log('Published close windows message.'))
        .catch(err => console.log(err));
}

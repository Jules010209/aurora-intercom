interface call {
    type: "call";
    position: string;
}

interface hangup {
    type: "hangup";
}

interface reject {
    type: "reject";
}

type handleFreq = call | hangup | reject;

export const handleIntercom = (props: handleFreq) => {
    switch(props.type) {
        case 'call': {
            window.electron.ipcRenderer.send('send_data', `INTERCOMCALL;${props.position}`);
        }
        break;
        case 'hangup': {
            window.electron.ipcRenderer.send('send_data', 'INTERCOMHANGUP');
        }
        break;
        case 'reject': {
            window.electron.ipcRenderer.send('send_data', `INTERCOMREJECT`);
        }
        break;
    }
}
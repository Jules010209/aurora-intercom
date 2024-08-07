interface call {
    type: "call";
    position: string;
}

interface anwser {
    type: "anwser";
}

interface hangup {
    type: "hangup";
}

interface reject {
    type: "reject";
}

type handleFreq = call | anwser | hangup | reject;

export const handleIntercom = (props: handleFreq) => {
    switch(props.type) {
        case 'call': {
            window.electron.ipcRenderer.send('send_data', `INTERCOMCALL;${props.position}`);
        }
        break;
        case 'anwser': {
            window.electron.ipcRenderer.send('send_data', `INTERCOMANWSER`);
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
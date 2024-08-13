import '../assets/panel.css';
import { useEffect, useState } from 'react';
import { handleIntercom } from '@renderer/utils/intercom';
import { ButtonProps, IntercomType, PositionType, Positions, Station } from '@renderer/types/panel';
import { LeftMenu, Menu } from './menu';

const menuData = {
    leftMenu: [
        { id: IntercomType.ANSWER, label: 'answer' },
        { id: IntercomType.HANGUP, label: 'hangup' },
        { id: IntercomType.REJECT, label: 'reject' },
        { id: 4, label: 'BLK' },
    ],
    rightMenu: [
        { stationType: PositionType.CTR, label: 'Center' },
        { stationType: PositionType.APP, label: 'Approach' },
        { stationType: PositionType.TWR, label: 'Tower' },
        { stationType: PositionType.MIL, label: 'Military' }
    ]
}

const Panel = () => {
    const [stations, setStations] = useState<Station[]>([]);
    const [stationType, setStationType] = useState<PositionType>(PositionType.CTR);
    // const [actualPosition, setActualPosition] = useState<string>('');
    const [calling, setCalling] = useState<boolean>(false);
    // const [callStation, setCallStation] = useState<string>('');

    let callStation = "";

    useEffect(() => {
        const fetchData = async () => {
            // window.electron.ipcRenderer.send('send_data', 'ATC');

            // window.electron.ipcRenderer.on('tcp_data', (_, data: string) => {
            //     const parsedStations = tcpParser(data, 'ATC', 0).filter(data => new RegExp(`(?:_${stationType})$`).test(data));

            //     // Fetch all stations
            //     // setStations(currentStations => {
            //     //   const updatedStations = [...currentStations, ...parsedStations];
            //     //   return Array.from(new Set(updatedStations));
            //     // });

            //     // This part of code works
            //     let initialArray: string[] = Array(30).fill("XXXX");

            //     const elements: number = Math.min(30, parsedStations.length);

            //     initialArray = parsedStations.slice(0, elements).concat(initialArray.slice(elements));

            //     setStations(initialArray);
            // });

            window.electron.ipcRenderer.invoke('config', 'positions').then((data: Positions) => {
                let initialArray = Array(30).fill({
                    label: 'XXXX',
                    frequency: 'XXX.XXX',
                    callsign: '',
                    color: null
                }) as Station[];

                const elements: number = Math.min(30, data[stationType].length);

                initialArray = data[stationType].slice(0, elements).concat(initialArray.slice(elements));

                return setStations(initialArray);
            });
        };

        // const fetchActualPosition = () => {
        //   window.electron.ipcRenderer.send('send_data', 'CONN');

        //   window.electron.ipcRenderer.on('tcp_data', (_, arg: string) => {
        //     const actualPosition = tcpParser(arg, 'CONN', 0).toString();
        //     setActualPosition(actualPosition);
        //   });
        // };

        // Appel
        // #INTERCOMCALL;LFMV_TWR

        // L'appel en train sonner
        // #INTERCOMPHONESTATUS;PHONE_PERFORMING;

        // L'appel est accepté
        // #INTERCOMCALLSTATUS;CALL_ACCEPTED;LFMV_TWR;;

        // L'appel en cours
        // #INTERCOMPHONESTATUS;PHONE_ONGOING;

        // Raccroche
        // #INTERHANGUP

        // Telephone se reset
        // #INTERCOMPHONESTATUS;PHONE_RESET;


        // Appel entrant
        // #INTERCOMCALLSTATUS;CALL_INCOMING;LFML_APP;;

        // #INTERCOMPHONESTATUS;PHONE_RECEIVING;

        // #INTERCOMCALLSTATUS;CALL_CANCELED;;;

        // #INTERCOMPHONESTATUS;PHONE_RESET;

        

        fetchData();
        // fetchActualPosition();

        return () => {
            window.electron.ipcRenderer.removeAllListeners('tcp_data');
        };
    }, [stationType]);

    useEffect(() => {
        window.electron.ipcRenderer.on('tcp_data', (_, data: string) => {
            if(data.match('#INTERCOMCALL') && !data.match('#INTERCOMCALLSTATUS'))
                callStation = data.split(';')[1];
                console.log(callStation);

            if(data.match('#INTERCOMPHONESTATUS') && data.split(";")[1].match('PHONE_PERFORMING')) {
                // Start a call
                setCalling(true);

                // setInterval(() => {
                //     if(data.match('#INTERCOMCALLSTATUS') && data.split(";")[1].match('CALL_REJECTED')) {
                //         console.log('call rejected!');
                //         setCalling(false);
                //         console.log(calling);
                //     } else if(data.match('#INTERCOMCALLSTATUS') && data.split(";")[1].match('CALL_ACCEPTED')) {
                //         console.log('call accepted!');
                //         setCalling(false);
                //         console.log(calling);
                //     } else {
                //         console.log('call not accepted!');
                //         setCalling(false); 
                //     }
                
                //     console.log(calling);
                // }, 3000);
            } else {
                // Call perfoming stop
                setCalling(false);
                callStation = '';
            }
            // console.log(tcpParser(data, 'INTERCOMCALL', 0));
            // console.log(tcpParser(data, 'INTERCOMPHONESTATUS', 0));
        });

        return () => {
            window.electron.ipcRenderer.removeAllListeners('tcp_data');
        };
    });

    const Button = ({ position, color }: ButtonProps) => {
        return <div className="button" style={{ backgroundColor: color }}>
            <div>{position.label}</div>
            <div>{position.frequency}</div>
        </div>
    }

    return (
        <div className="app">
            <div className="vertical-menu-container">
                <LeftMenu items={menuData.leftMenu}/>
            </div>
            <div className="control-panel">
                {stations.map((position) => (
                    <>
                        <div
                            key={position.label}
                            onClick={() => handleIntercom({ type: "call", position: position.callsign })}
                        >
                            <Button
                                key={position.label}
                                position={position}
                                color={position.callsign === callStation && calling ? "green" : position.color}
                            />
                        </div>
                    </>
                ))}
            </div>
            <div className="vertical-menu-container">
                <Menu clickable={true} items={menuData.rightMenu} setStationType={setStationType}/>
            </div>
        </div>
    );
}

export default Panel;
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
                    callsign: 'XXXX_XXX',
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

        fetchData();
        // fetchActualPosition();

        // return () => {
        //     window.electron.ipcRenderer.removeAllListeners('tcp_data');
        // };
    }, [stationType]);

    const Button = ({ position }: ButtonProps) => {
        return <div className="button" style={{ backgroundColor: position.color }}>
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
                        <div onClick={() => handleIntercom({ type: "call", position: position.callsign })}>
                            <Button
                                key={position.label}
                                position={position}
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
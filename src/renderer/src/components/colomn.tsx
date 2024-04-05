import '../assets/colomn.css';
import { useEffect, useState } from 'react';
import { tcpParser } from '@renderer/utils/tcp';
import { handleIntercom } from '@renderer/utils/intercom';

enum Positions {
    CTR = "CTR",
    APP = "APP",
    TWR = "TWR",
    MIL = "MIL",
}

const mockData = {
    leftMenu: [
        { id: 1, label: 'BLK' },
        { id: 2, label: 'BLK' },
        { id: 3, label: 'BLK' },
        { id: 4, label: 'BLK' },
    ],
    rightMenu: [
        { stationType: Positions.CTR, label: 'Center' },
        { stationType: Positions.APP, label: 'Approach' },
        { stationType: Positions.TWR, label: 'Tower' },
        { stationType: Positions.MIL, label: 'Military' }
    ]
}

interface Item {
    id?: number;
    label: string;
    stationType?: Positions
}

interface MenuProps {
    items: Item[];
    clickable: boolean;
}

const Colomn = () => {
    const [stations, setStations] = useState<string[]>([]);
    const [stationType, setStationType] = useState<Positions>(Positions.CTR);
    const [actualPosition, setActualPosition] = useState<string>('');

    const Menu = ({ items, clickable }: MenuProps) => {
        return (
            <div className="menu">
                {items.map((item) => (
                    <button
                        onClick={() =>
                            clickable
                                ? setStationType(item.stationType as Positions)
                                : null}
                        key={item.id}
                        className="menu-item"
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        )
    }

    useEffect(() => {
        const fetchData = async () => {
            window.electron.ipcRenderer.send('send_data', 'ATC');

            window.electron.ipcRenderer.on('tcp_data', (_, data: string) => {
                const parsedStations = tcpParser(data, 'ATC', 0).filter(data => new RegExp(`(?:_${stationType})$`).test(data));

                // Fetch all stations
                // setStations(currentStations => {
                //   const updatedStations = [...currentStations, ...parsedStations];
                //   return Array.from(new Set(updatedStations));
                // });

                // This part of code works
                let initialArray: string[] = Array(30).fill("XXXX");

                const elements: number = Math.min(30, parsedStations.length);

                initialArray = parsedStations.slice(0, elements).concat(initialArray.slice(elements));

                setStations(initialArray);
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

        return () => {
            window.electron.ipcRenderer.removeAllListeners('tcp_data');
        };
    }, [stationType]);

    const Button = ({ label }) => {
        return <div className="button">{label}</div>
    }

    return (
        <div className="app">
            <div className="vertical-menu-container">
                <Menu clickable={false} items={mockData.leftMenu} />
            </div>
            <div className="control-panel">
                {stations.map((button) => (
                    <>
                        <div onClick={() => handleIntercom({ type: "call", position: button })}>
                            <Button key={button} label={button.split("_")[0]}/>
                        </div>
                    </>
                ))}
            </div>
            <div className="vertical-menu-container">
                <Menu clickable={true} items={mockData.rightMenu} />
            </div>
        </div>
    );
}

export default Colomn;
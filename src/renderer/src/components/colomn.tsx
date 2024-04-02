import { useEffect, useState } from 'react';
import '../assets/colomn.css';
import { tcpParser } from '@renderer/utils/tcp';

enum Positions {
    CTR = "CTR",
    APP = "APP",
    TWR = "TWR",
    MIL = "MIL",
}

const mockData = {
    buttons: [
        { id: 1, label: 'SHEA' },
        { id: 2, label: 'GK' },
        { id: 3, label: 'S1A' },
        { id: 4, label: 'UK' },
        { id: 5, label: 'UZ' },
        { id: 6, label: 'TM' },
    ],
    leftMenu: [
        { id: 1, label: '' },
        { id: 2, label: '' },
        { id: 3, label: '' },
        { id: 4, label: '' },
        { id: 5, label: '' },
        { id: 6, label: '' }
    ],
    rightMenu: [
        { stationType: Positions.CTR, label: 'Center' },
        { stationType: Positions.APP, label: 'Approach' },
        { stationType: Positions.TWR, label: 'Tower' },
        { stationType: Positions.MIL, label: 'Military' }
    ]
}

const Button = ({ label }) => {
    return <div className="button">{label}</div>
}

const Colomn = () => {
    const [stations, setStations] = useState<string[]>([]);
    const [stationType, setStationType] = useState<Positions>(Positions.CTR);
    const [actualPosition, setActualPosition] = useState<string>('');

    const Menu = ({ items }) => {
        return (
            <div className="menu">
                {items.map((item) => (
                    <button onClick={() => setStationType(item.stationType)} key={item.id} className="menu-item">
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

            setStations(parsedStations);
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
    
    return (
        <div className="app">
            <Menu items={mockData.leftMenu} />
            <div className="control-panel">
                {/* {mockData.buttons.map((button) => (
                    <Button key={button.id} label={button.label} />
                ))} */}
                {stations.map((button) => (
                    <Button key={button} label={button.split("_")[0]}></Button>
                ))}
            </div>
            <Menu items={mockData.rightMenu} />
        </div>
    );
}

export default Colomn;
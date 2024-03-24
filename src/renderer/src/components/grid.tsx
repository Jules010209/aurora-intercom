import { useEffect, useState } from 'react';
// import '../assets/grid.css';
import { tcpParser } from '@renderer/utils/tcp';
import { Grid, GridItem, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';


interface Cell {
  row: number;
  col: number;
}

const GridComponent = (): JSX.Element => {
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [actualPosition, setActualPosition] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      window.electron.ipcRenderer.send('send_data', 'ATC');

      window.electron.ipcRenderer.on('tcp_data', (_, arg: string) => {
        const parsedStations = tcpParser(arg, 'ATC', 0);

        const filteredStations = parsedStations.filter(station => station !== "\r\n");
        setStations(currentStations => {
          const updatedStations = [...currentStations, ...filteredStations];
          return Array.from(new Set(updatedStations));
        });
      });
    };

    fetchData();

    return () => {
      window.electron.ipcRenderer.removeAllListeners('tcp_data');
    };
  }, []);

  useEffect(() => {
    const fetchActualPosition = () => {
      window.electron.ipcRenderer.send('send_data', 'CONN');
  
      window.electron.ipcRenderer.on('tcp_data', (_, arg: string) => {
        const parsedStations = tcpParser(arg, 'CONN', 0);
        const filteredStations = parsedStations.filter(station => station !== "\r\n");
        const actualPosition = filteredStations.toString();
        setActualPosition(actualPosition);
      });
    };
  
    fetchActualPosition();
  
    return () => {
      window.electron.ipcRenderer.removeAllListeners('tcp_data');
    };
  }, []);

  const handleClick = (row: number, col: number) => {
    const position = { row, col };
    setSelectedCells(currentCells => {
      const cellIndex = currentCells.findIndex(cell => cell.row === row && cell.col === col);
      if (cellIndex === -1) {
        return [...currentCells, position];
      } else {
        return currentCells.filter(cell => !(cell.row === row && cell.col === col));
      }
    });
  };

  const handleFrequencyClick = (position: string) => {
    setSelectedFrequency(position);
    // Effectuer une requête TCP "intercom" avec la fréquence sélectionnée
    // window.electron.ipcRenderer.send('send_data', `INTERCOMCALL;${position}`);
  };

  // const handleFrequencyRejectCall = () => {
  //   console.log("reject");
  //   window.electron.ipcRenderer.send('send_data', `INTERCOMREJECT`);
  // }

  const renderCells = () => {
    const cells: JSX.Element[] = [];

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`cell ${selectedCells.some(cell => cell.row === row && cell.col === col) ? 'selected' : ''}`}
            onClick={() => handleClick(row, col)}
          ></div>
        );
      }
    }

    return cells;
  };

  const renderFrequencyPanel = () => {
    return (
      <div className="frequency-panel">
        <h2>Frequencies</h2>
        <ul>
          {stations.map((frequency, index) => (
            <li key={index} onClick={() => handleFrequencyClick(frequency)}>
              {frequency}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="grid-background">
      <Tabs variant='enclosed' orientation='vertical'>
        <TabList>
          <Tab>Frequency</Tab>
          <Tab>Stations</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <p>one!</p>
          </TabPanel>
          <TabPanel>
            <Grid templateColumns='repeat(5, 1fr)' gap={6}>
              <GridItem w='100%' h='10' bg='blue.500' />
              <GridItem w='100%' h='10' bg='blue.500' />
              <GridItem w='100%' h='10' bg='blue.500' />
              <GridItem w='100%' h='10' bg='blue.500' />
              <GridItem w='100%' h='10' bg='blue.500' />
            </Grid>
            {/* <div className="grid-container">
              <div className="grid">{renderCells()}</div>
              <div className="panel">{renderFrequencyPanel()}</div>
              <div className="panel">{actualPosition}</div>
            </div>
            <div className="selected-frequency">
              Selected Frequency: {selectedFrequency}
            </div> */}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}

export default GridComponent;
import { useEffect, useState } from 'react';
// import '../assets/grid.css';
import { tcpParser } from '@renderer/utils/tcp';
import { Button, Center, Flex, Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';

const GridComponent = (): JSX.Element => {
  const [stations, setStations] = useState<string[]>([]);
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [actualPosition, setActualPosition] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      window.electron.ipcRenderer.send('send_data', 'ATC');

      window.electron.ipcRenderer.on('tcp_data', (_, data: string) => {
        const parsedStations = tcpParser(data, 'ATC', 0).filter(data => /(?:_DEL|_GND|_TWR|_FIS|_APP|_CTR)$/.test(data));

        setStations(currentStations => {
          const updatedStations = [...currentStations, ...parsedStations];
          return Array.from(new Set(updatedStations));
        });
      });
    };

    const fetchActualPosition = () => {
      window.electron.ipcRenderer.send('send_data', 'CONN');
  
      window.electron.ipcRenderer.on('tcp_data', (_, arg: string) => {
        const actualPosition = tcpParser(arg, 'CONN', 0).toString();
        setActualPosition(actualPosition);
      });
    };
  
    fetchData();
    fetchActualPosition();

    return () => {
      window.electron.ipcRenderer.removeAllListeners('tcp_data');
    };
  }, []);

  const handleFrequencyClick = (position: string) => {
    setSelectedFrequency(position);
    // Effectuer une requête TCP "intercom" avec la fréquence sélectionnée
    window.electron.ipcRenderer.send('send_data', `INTERCOMCALL;${position}`);
  };

  const handleIntercomHangup = () => {
    window.electron.ipcRenderer.send('send_data', 'INTERCOMHANGUP');
  }

  const handleFrequencyRejectCall = () => {
    window.electron.ipcRenderer.send('send_data', `INTERCOMREJECT`);
  }

  const renderFrequencyPanel = () => {
    return (
      <Stack direction='row' spacing={1} align='center'>
        {stations.map((frequency, index) => (
          <Button key={index} onClick={() => handleFrequencyClick(frequency)} colorScheme='teal' variant='solid'>
            {frequency}
          </Button>
        ))}
      </Stack>
    );
  };

  return (
    <>
      <Tabs isFitted variant='enclosed' orientation='horizontal'>
        <TabList>
          <Tab>Frequency</Tab>
          <Tab>Stations</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Flex color='red' w='max-content' h={'100%'}>
              <Center width='100%' bg='green.500'>
                {/* <Text>Box 1</Text> */}
                <p>test</p>
              </Center>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Flex color='red' w={'100%'} h={'100%'}>
              {renderFrequencyPanel()}
              <p onClick={() => handleIntercomHangup()}>End call</p>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  );
}

export default GridComponent;
import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import Grid from './components/grid'
import { Spinner } from '@chakra-ui/react';

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

  return (
    <>
      {}
      <Spinner size='xl' />
      {/* <Grid /> */}
    </>
  )
}

export default App

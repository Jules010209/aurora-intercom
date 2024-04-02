// import Grid from './components/grid'
import Colomn from './components/colomn';

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

  return (
    <>
      {/* <Grid /> */}
      <Colomn/>
    </>
  )
}

export default App

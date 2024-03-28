import Grid from './components/grid'

function App(): JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping');

  return (
    <>
      <Grid />
    </>
  )
}

export default App

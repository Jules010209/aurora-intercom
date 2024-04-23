# Aurora Intercom

![image](https://github.com/Jules010209/aurora-intercom/assets/67187964/fbf74818-7fc6-4525-8672-ba5e50a2449b)
Here's a web application that represents a controller intercom.

## Run Locally

Clone the project

```bash
  git clone https://github.com/Jules010209/aurora-intercom
```

Go to the project directory

```bash
  cd aurora-intercom
```

Install dependencies

```bash
  npm install
```

Start application

```bash
  npm run dev
```


## Create config file

Here the config path:
`C:\Users\%username%\AppData\Roaming\aurora-intercom\config.json`

`> config.json`
```json
{
    "positions": {
        "CTR": [
            {
                "label": "LFBB",
                "frequency": "130.43",
                "callsign": "LFBB_CTR",
                "color": "BLUE"
            },
            {
                "label": "LFBB",
                "frequency": "120.33",
                "callsign": "LFBB_U_CTR",
                "color": "GREEN"
            }
        ],
        "APP": [...],
        "TWR": [...],
        "MIL": [...]
    }
}
```

### Positions Reference

| name             | type                                                                |
| ----------------- | ------------------------------------------------------------------ |
| CTR | array of position (CTR) |
| APP | array of position (APP) |
| TWR | array of position (DEL, GND, TWR) |
| MIL | array of position (GND, TWR, APP, CTR) |


### Position Reference

| name             | type                                                                |
| ----------------- | ------------------------------------------------------------------ |
| label | string |
| frequency | string |
| callsign | string |
| color | string (HTMLColor & HEX) |

## Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

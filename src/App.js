import logo from "./logo.svg";
import "./App.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Interview from "./views/Interview";
const MicRecorder = require("mic-recorder-to-mp3");

const darkTheme = createTheme({
	palette: {
		background: {
			default: "#001E3C",
		},
		mode: "dark",
	},
});

function App() {
	return (
		<ThemeProvider theme={darkTheme}>
			<CssBaseline />
			<Interview />
		</ThemeProvider>
	);
}

export default App;

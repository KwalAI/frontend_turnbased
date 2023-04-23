import React, { useState, useEffect } from "react";
import {
	Grid,
	Button,
	TextField,
	Container,
	Typography,
	IconButton,
	Paper,
	Dialog,
	DialogTitle,
	DialogActions,
	CircularProgress,
	LinearProgress,
} from "@mui/material";
import MicOffIcon from "@mui/icons-material/MicOff";
import MicIcon from "@mui/icons-material/Mic";
import CancelIcon from "@mui/icons-material/Cancel";
import RecordRTC, { RecordRTCPromisesHandler } from "recordrtc";

export const useRecorderPermission = (recordingType) => {
	const [recorder, setRecorder] = useState();
	useEffect(() => {
		getPermissionInitializeRecorder();
	}, []);
	const getPermissionInitializeRecorder = async () => {
		let stream = await navigator.mediaDevices.getUserMedia({
			video: false,
			audio: true,
		});
		let recorder = new RecordRTCPromisesHandler(stream, {
			type: recordingType,
		});
		setRecorder(recorder);
	};
	return recorder;
};

function Interview() {
	const [link, setLink] = useState("");
	const [error, setError] = useState(false);
	const [linkedinProfile, setLinkedinProfile] = useState("");
	const [isRecording, setIsRecording] = useState(false);
	const [openDialog, setOpenDialog] = React.useState(false);
	const [isLoadingResponse, setIsLoadingResponse] = React.useState(false);
	const ctx = new AudioContext();
	const recorder = useRecorderPermission("audio");

	const handleDialogOpen = () => {
		setOpenDialog(true);
	};

	const handleDialogClose = () => {
		setOpenDialog(false);
	};

	const handleEndInterview = () => {
		setLinkedinProfile("");
		handleDialogClose();
	};

	const startRecording = async () => {
		setIsRecording(true);
		recorder.startRecording();
	};
	const stopRecording = async () => {
		setIsLoadingResponse(true);
		setIsRecording(false);
		await recorder.stopRecording();
		let blob = await recorder.getBlob();
		const fd = new FormData();
		fd.append("audio", blob);
		fetch("https://backendturnbased-trial.up.railway.app/conversation", {
			headers: { Accept: "application/json" },
			method: "POST",
			body: fd,
		})
			.then((data) => data.arrayBuffer())
			.then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
			.then((decodedAudio) => {
				// audio = ;
				setIsLoadingResponse(false);
				const playSound = ctx.createBufferSource();
				playSound.buffer = decodedAudio;
				playSound.connect(ctx.destination);
				playSound.start(ctx.currentTime);
			});
	};
	const handleInputChange = (e) => setLink(e.target.value);
	const handleSubmit = () => {
		if (link !== "") {
			setLinkedinProfile(link);
			const requestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ link: link }),
			};
			fetch(
				// "https://voicebotbackend-production.up.railway.app/profile",
				"/profile",
				requestOptions
			)
				.then((response) => response.json())
				.then((data) => {
					setLinkedinProfile(link);
				});
		} else {
			setError(true);
		}
	};

	useEffect(() => {
		if (linkedinProfile != "") {
			fetch("https://backendturnbased-trial.up.railway.app/welcome-instructions", {
				headers: { Accept: "application/json" },
				method: "GET",
			})
				.then((data) => data.arrayBuffer())
				.then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
				.then((decodedAudio) => {
					const playSound = ctx.createBufferSource();
					playSound.buffer = decodedAudio;
					playSound.connect(ctx.destination);
					playSound.start(ctx.currentTime);
				});
		}
	}, [linkedinProfile]);

	return (
		<Container maxWidth="xl">
			<Grid
				sx={{ minHeight: "100vh" }}
				container
				direction="column"
				justifyContent="center"
				alignItems="center"
				spacing={2}
			>
				<Grid item xs={12}>
					<Grid container direction="row" justifyContent="center" spacing={2}>
						{linkedinProfile == "" && (
							<>
								<Grid item xs={12}>
									<Typography variant="h3">Welcome to your Interview</Typography>
								</Grid>
								<Grid item xs={12}>
									<Grid container spacing={1}>
										<Grid item xs={11}>
											<TextField
												id="outlined-basic"
												variant="outlined"
												label="Please provide your link to your LinkedIn Profile"
												size="small"
												fullWidth
												value={link}
												onChange={handleInputChange}
											/>
										</Grid>
										<Grid item xs={1}>
											<Button
												variant="contained"
												disabled={link == ""}
												type="submit"
												onClick={handleSubmit}
											>
												Start
											</Button>
										</Grid>
									</Grid>
								</Grid>
							</>
						)}
						{linkedinProfile !== "" && (
							<>
								<Grid item xs={12} sx={{ textAlign: "center" }}>
									<Typography variant="h3">Welcome to your Interview</Typography>
								</Grid>
								<Grid item xs={12}>
									<Grid container justifyContent="center" spacing={4}>
										<Grid item>
											<Button
												onClick={isRecording ? stopRecording : startRecording}
												variant="contained"
												startIcon={
													isRecording ? (
														<MicIcon sx={{ fontSize: 40 }} />
													) : (
														<MicOffIcon sx={{ fontSize: 40 }} />
													)
												}
											>
												{isRecording ? "Mute" : "Unmute"}
											</Button>
										</Grid>
										<Grid item>
											<Button
												color="error"
												variant="contained"
												startIcon={<CancelIcon sx={{ fontSize: 40 }} />}
												onClick={handleDialogOpen}
											>
												End Interview
											</Button>
											<Dialog open={openDialog} onClose={handleDialogClose}>
												<DialogTitle>
													Are you sure you want to end the interview?
												</DialogTitle>
												<DialogActions>
													<Button onClick={handleDialogClose}>No</Button>
													<Button onClick={handleEndInterview}>Yes</Button>
												</DialogActions>
											</Dialog>
										</Grid>
									</Grid>
								</Grid>
								{isLoadingResponse && (
									<Grid item sx={{ textAlign: "center" }}>
										<Typography gutterBottom>Calculating Response</Typography>
										<LinearProgress color="secondary" />
									</Grid>
								)}
								{/* <Grid item xs={12} sx={{ textAlign: "center" }}>
									<Typography variant="p" color="textSecondary">
										Please unmute to start conversation and mute to record your response.
									</Typography>
								</Grid> */}
							</>
						)}
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
}
export default Interview;

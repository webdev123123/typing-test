import React from "react";
import Result from "./components/Result";
import Test from "./components/Test";
import { words } from "./helpers/words.json";
import "./App.scss";

const options = {
	time: [15, 30, 45, 60],
	theme: ["default", "mkbhd", "coral", "ocean", "azure", "forest"],
};

export default class App extends React.Component {
	words = words.sort(() => Math.random() - 0.5);
	state = {
		currWord: this.words[0],
		typedWord: "",
		timer: 60,
		correctWords: 0,
		incorrectWords: 0,
		correctChars: 0,
		incorrectChars: 0,
		setTimer: null,
		timeLimit: 60,
	};

	startTimer = () => {
		const intervalId = setInterval(() => {
			this.setState({ timer: this.state.timer - 1 }, () => {
				if (this.state.timer === 0) {
					clearInterval(this.state.setTimer);
					this.setState({ setTimer: null });
				}
			});
		}, 1000);
		this.setState({
			setTimer: intervalId,
		});
	};

	recordTest = (e) => {
		const {
			typedWord,
			currWord,
			correctChars,
			correctWords,
			incorrectChars,
			incorrectWords,
			timer,
			timeLimit,
			setTimer,
		} = this.state;
		if (timer === 0) {
			if (e.key === "Tab") {
				this.resetTest();
				e.preventDefault();
			}
			return;
		}
		if (setTimer === null && e.key !== "Tab") this.startTimer();
		const currIdx = this.words.indexOf(currWord);
		const currWordEl = document.getElementById("active");
		currWordEl.scrollIntoView({ behavior: "smooth", block: "center" });
		const caret = document.getElementById("caret");
		caret.classList.remove("blink");
		setTimeout(() => caret.classList.add("blink"), 500);
		switch (e.key) {
			case "Tab":
				if (timer !== timeLimit || setTimer) {
					this.resetTest();
					document.getElementsByClassName("word")[0].scrollIntoView();
				}
				e.preventDefault();
				break;
			case " ":
				if (typedWord === "") {
					return;
				}
				if (currWord === typedWord) {
					this.setState({
						correctWords: correctWords + 1,
						correctChars: correctChars + currWord.length,
					});
				} else {
					this.setState({
						incorrectWords: incorrectWords + 1,
						incorrectChars: incorrectChars + currWord.length,
					});
				}
				currWordEl.classList.add(
					typedWord !== currWord ? "wrong" : "right"
				);
				this.setState({
					typedWord: "",
					currWord: this.words[currIdx + 1],
				});
				break;
			case "Backspace":
				if (e.ctrlKey) {
					this.setState({ typedWord: "" });
					currWordEl.childNodes.forEach((char) => {
						char.classList.remove("wrong", "right");
					});
				} else {
					this.setState(
						{
							typedWord: typedWord.slice(0, typedWord.length - 1),
						},
						() => {
							const { typedWord } = this.state;
							let idx = typedWord.length;
							if (idx < currWord.length)
								currWordEl.children[idx + 1].classList.remove(
									"wrong",
									"right"
								);
						}
					);
				}
				break;
			default:
				this.setState({ typedWord: typedWord + e.key }, () => {
					const { typedWord } = this.state;
					let idx = typedWord.length - 1;
					currWordEl.children[idx + 1].classList.add(
						currWord[idx] !== typedWord[idx] ? "wrong" : "right"
					);
				});
				break;
		}
	};

	resetTest = () => {
		document
			.querySelectorAll(".wrong, .right")
			.forEach((el) => el.classList.remove("wrong", "right"));
		this.words = this.words.sort(() => Math.random() - 0.5);
		clearInterval(this.state.setTimer);
		this.setState({
			timer: this.state.timeLimit,
			currWord: this.words[0],
			typedWord: "",
			correctChars: 0,
			correctWords: 0,
			incorrectWords: 0,
			incorrectChars: 0,
			setTimer: null,
		});
	};

	componentDidMount() {
		const theme = localStorage.getItem("theme");
		const time = +localStorage.getItem("time");
		if (theme) {
			document.body.children[1].classList.add(theme);
		}
		if (time) {
			this.setState({
				timer: time,
				timeLimit: time,
			});
		}
		document
			.querySelector(`button[value="${theme ? theme : "default"}"]`)
			.classList.add("selected");
		document
			.querySelector(`button[value="${time ? time : 60}"]`)
			.classList.add("selected");
		window.onkeydown = (e) => {
			if (
				e.key.length === 1 ||
				e.key === "Backspace" ||
				e.key === "Tab"
			) {
				this.recordTest(e);
			}
		};
	}

	componentWillUnmount() {
		window.onkeydown = null;
	}

	handleOptions = (e) => {
		switch (e.target.dataset.option) {
			case "theme":
				document.body.children[1].classList.remove(...options.theme);
				document.body.children[1].classList.add(e.target.value);
				break;
			case "time":
				this.setState({
					timer: e.target.value,
					timeLimit: e.target.value,
					currWord: this.words[0],
					typedWord: "",
					correctWords: 0,
					correctChars: 0,
					incorrectWords: 0,
					incorrectChars: 0,
				});
				break;
			default:
				break;
		}
		localStorage.setItem(e.target.dataset.option, e.target.value);
		document
			.querySelectorAll(`.${e.target.dataset.option} button`)
			.forEach((btn) => {
				btn.classList.remove("selected");
			});
		e.target.classList.add("selected");
		e.target.blur();
	};

	render() {
		const { setTimer, timer } = this.state;
		return (
			<>
				<header className={setTimer !== null ? "hidden" : ""}>
					<a href="." className="brand">
						typing-test
					</a>
					<div className="buttons">
						{Object.entries(options).map(([option, choices]) => (
							<div key={option} className={option}>
								{option}:
								{choices.map((choice) => (
									<button
										className="mini"
										key={choice}
										data-option={option}
										value={choice}
										onClick={this.handleOptions}
									>
										{choice}
									</button>
								))}
							</div>
						))}
					</div>
				</header>
				{timer !== 0 ? (
					<Test
						words={this.words}
						currWord={this.state.currWord}
						typedWord={this.state.typedWord}
						setTimer={this.state.setTimer}
						timer={this.state.timer}
					/>
				) : (
					<Result
						data={this.state}
						spaces={this.words.indexOf(this.state.currWord)}
						resetTest={() => this.resetTest()}
					/>
				)}
				<div
					className={`bottom-area ${
						setTimer !== null ? "hidden" : ""
					}`}
				>
					<span className="hint">
						<kbd>Tab</kbd> to restart test
					</span>
					<footer>
						<a href="https://www.github.com/salmannotkhan/Typing-Test">
							<span>&lt;/&gt;</span>
							github
						</a>
						<span>
							created by{" "}
							<a href="https://www.github.com/salmannotkhan">
								@salmannotkhan
							</a>
						</span>
					</footer>
				</div>
			</>
		);
	}
}

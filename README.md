# ChessHub - CSCI2020U Final Project Group 1

Our project is a chess application built using Java Web Applications and HTML/CSS/JS. It allows players to play chess with another player or a computer, as well as solving chess puzzles. The server utilizes WebSockets for the online component along with HTML, CSS, and JavaScript for client-side interaction across all modes. The primary goal of this project is to implement everything we learnt in this course into a full stack web application.

#### Disclaimer: This is a project that we did as part of a university assignment. DO NOT COPY THIS.

## Group Members

* [Kershan Arulneswaran](https://github.com/Koops0) - Websockets, Server, Online Multiplayer, Chess Moves, Comments, Readme and Video Demo
* [Simon Berhe](https://github.com/Its-Simon) - Audio Implementation, Timer, Title Page and About Page
* [Mujtaba Chaudhry](https://github.com/mujtabach2) - Primary Chess Logic, Chess Moves and Move Validation, Puzzles, Computer Player and ELO Leaderboard
* [Haider Saleem](https://github.com/Haider425) - Chess Board, Pieces, Themes, Rules, Highlighted Moves, Popups and Sidebar

All of us have contributed equally, although I (Kershan) didn't start until late Sunday (4/14), due to the Computational Science exam.

## Video Demo

## Features

* Seamless Multiplayer: Real-time multiplayer chess gameplay using websockets for seamless communication between players.
* Challenging Puzzles: Incorporated a puzzle mode offering a daily puzzle for users to solve.
* Difficult Opponent: Used wukongJS to create a CPU that can provide challenging gameplay for users against the computer.
* Enhanced User Interface: Responsive and intuitive user interface for smooth navigation and enjoyable gameplay across clients.

## Getting Started

To get started with the emulator, follow these steps:

1. Clone the repository using the command:
   ```bash
   git clone https://github.com/OntarioTech-CS-program/w24-csci2020u-final-project-arulneswaran-berhe-chaudhry-saleem-1/
2. Open in IntelliJ IDEA as Admin with the folder: /w24-csci2020u-final-project-arulneswaran-berhe-chaudhry-saleem-1
3. Edit the configuration so that the URL is http://localhost:8080/chessproject-1.0-SNAPSHOT/
4. Deploy GlassFish server
5. In Visual Studio Code, run the VS Code Live Server Extension on any HTML page.
6. Start Playing!

## Special Thanks
Other than the Jakarta EE, java.io and java.util libraries, we would like to credit the following:
* [Chess.com's Chess Notation Page](https://www.chess.com/terms/chess-notation) for main.js notation function
* [WukongJS](https://github.com/maksimKorzh/wukong) for wukong.js
* [chess.js](https://github.com/jhlywa/chess.js) for chessImport.js

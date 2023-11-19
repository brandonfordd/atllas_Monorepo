# Monorepo Project | Atllas Takehome

This monorepo consists of three packages: back-end, front-end, and mobile. The project utilizes Next.js for the web portion and Expo for the mobile application, with a shared backend implemented using Express.js and Sequelize. 

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)

## Introduction

This project was to create a working native react application that works with the backend to login, register, and logout a authorized user. This app has a working Webview in the native react application the utilized the existing infrastructure from the backend to remember Users login state and data. Once logged in and authorized, the user can play a simple game of rock, papers, scissors shoot.

## Features

- Mobile Native React application.
- Register a user.
- Login a user.
- Authorize a user.
- Logout a user.
- Working webview that passes user information and authorization.
- Working simple game of rock, paper, and scissor shoot.
- Builds with no warnings or errors on the first try.
- No lint or typescript errors.

## Getting Started

### Prerequisites

If you test on the simulator, everything should work no problem through
localhost and you can skip this. However, if you want to test on a physical
device, there's some network-related config to do.

Thankfully, all of this can be done through env vars and dotenv!

### `packages/back-end`:

You should create a .env file in the root of your backend folder. In this please add `EXPRESS_HOST=YOUR_LOCAL_IP` in the file, change the YOUR_LOCAL_IP text with your local IP , e.g. `EXPRESS_HOST=192.174.1.24`.

### `packages/front-end`:

You should copy `.env.development` to `.env.local` and set `BACK_END_HOST` to
your local IP, e.g. 192.174.1.24.

### `packages/mobile`:

You should copy `.env.development` to `.env.local` and
set `EXPO_PUBLIC_WEBAPP_ROOT` and `EXPO_PUBLIC_API_URL` to include local IP, e.g.
`http://192.174.1.24:3000/` and `http://192.174.1.24:50000/` .

### `Windows Considerations`:
For Windows systems, depending on your firewall settings, you may need to allow
the ports you'll be using since network access will be through your router
rather than the loopback resolver.

### Installation

Step-by-step instructions on how to install.

In the root directory of the project open the integrated terminal and run
```bash
npm i
```
&
```bash
npm run seed
```
npm run seed will start you db file and populate it with default users 
* `admin:admin`, `test:test`, and `user:password`

Change directory to  `packages/mobile` and run 
```bash
npm i
```

# Usage
After you have run `npm i` in the root directoy and mobile directory and seeded the database you can run there commands to start the servers

1. `npm run start` in the root directory
2. `npx expo start` in `packages/mobile`

If you using your own mobile device and not a simulated please download the expo app on your appropriate device then scan the QR code that is given once starting the expo server.
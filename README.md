# Multiplayer world

## Motivation

I always find myself making multiple **minigames**. So I wanted to build a sort of an environment where people can:
- move
- chat
- talk
- play

I also wanted to have some common things for the games:
- common menu
- matchmaking
- avatars

I propose for this the following architecture:

```mermaid
---
title: Multiplayer World
---
erDiagram
    REDIS 1+--1+ NODEJS : under_firewall
    REDIS {
        string id
        string name
        string lobby
        geo position
    }
    NODEJS {
        enum message_type
        string data
        string auth_token
    }
    GODOT 1--1+ NODEJS : websocket
    API_CLIENT 1--1+ NODEJS : websocket
```

## Requirements

- [Redis Stack](https://redis.io/download/)
- [Bun](https://bun.sh)

## Development
Create an .env file.

To start the development server run:
```bash
bun start
```

To connect from terminal a websocket, run:

```
bunx wscat -c ws://localhost:3000
```

## Commands


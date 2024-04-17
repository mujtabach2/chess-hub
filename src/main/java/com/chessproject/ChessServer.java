package com.chessproject;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@ServerEndpoint("/ws/{roomID}")
public class ChessServer {
    private static Map<String, ChessRoom> activeRooms = new HashMap<>();
    private Map<String, Map<Character, String>> turnList = new HashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("roomID") String roomID) throws IOException {
        ChessRoom room = activeRooms.getOrDefault(roomID, new ChessRoom(roomID, session.getId()));
        activeRooms.put(roomID, room);

        room.setUserName(session.getId(), "Player"); // Set user name

        //sets player colour based on number of users in the room
        String playerColor;
        if (room.getUsers().size() % 2 == 1) {
            playerColor = "white";
        } else {
            playerColor = "black";
        }

        session.getBasicRemote().sendText("{\"type\": \"colourAssignment\", \"color\":\"" + playerColor + "\"}");

        session.getBasicRemote().sendText("{\"type\": \"welcome\", \"message\":\"Welcome to King's Conquest!\"}");
    }

    @OnMessage
    public void handleMessage(String message, Session session) throws IOException {
        ChessRoom room = activeRooms.get(session.getPathParameters().get("roomID"));
        String roomID = session.getPathParameters().get("roomID");

        //check if room exists and JSON message is of type 'move'
        if (room != null && message.contains("\"type\":\"move\"")) {
            // Put the player, colour and turn to the turnList if not already in it
            if (!turnList.containsKey(room.getCode())) {
                Map<Character, String> player = new HashMap<>();
                player.put('W', room.getUsers().get(session.getId()));
                player.put('B', room.getUsers().get(session.getId()));
                turnList.put(room.getUserName(session.getId()), player);
            }
        }

        for (Session s : session.getOpenSessions()) {
            String sRoomID = s.getPathParameters().get("roomID");
            if (sRoomID != null && sRoomID.equals(roomID) && !s.getId().equals(session.getId())) {
                try {
                    s.getBasicRemote().sendText(message); // Broadcast the move to all clients in the same room
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        throwable.printStackTrace();
    }

    @OnClose
    public void onClose(Session session) {
        ChessRoom room = activeRooms.get(session.getPathParameters().get("roomID"));

        if (room != null) {
            room.removeUser(session.getId());
            if (room.getUsers().isEmpty()) {
                activeRooms.remove(room.getCode());
            }
        }
    }
}

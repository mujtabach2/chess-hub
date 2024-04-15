package com.chessproject;

import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@ServerEndpoint("/ws/{roomID}")
public class ChessServer {
    private static Map<String, String> roomList = new HashMap<>();
    private static Map<String, String> turnList = new HashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("roomID") String roomID) throws IOException {
        roomList.put(session.getId(), roomID);
        if (!turnList.containsKey(roomID)) {
            turnList.put(roomID, session.getId());
        }
        // Send initial message after confirming the connection is open
        session.getBasicRemote().sendText("Hello!");
    }

    @OnMessage
    public void handleMessage(String message, Session session) throws IOException {
        String roomID = roomList.get(session.getId());

        for (Session s : session.getOpenSessions()) {
            if (roomList.get(s.getId()).equals(roomID) && !s.getId().equals(session.getId())) {
                s.getBasicRemote().sendText(message);
            }
        }
    }

    @OnError
    public void onError(Session session, Throwable throwable) {
        throwable.printStackTrace();
        // Additional error handling logic can be added here, such as logging or sending an error message to the client
    }

    @OnClose
    public void onClose(Session session) {
        String roomID = roomList.get(session.getId());
        roomList.remove(session.getId());
        if (roomID != null && turnList.get(roomID) != null && turnList.get(roomID).equals(session.getId())) {
            // If the closing session was the current turn holder, remove the turn holder
            turnList.remove(roomID);
        }
    }
}

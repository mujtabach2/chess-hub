package com.chessproject;
import java.util.HashMap;
import java.util.Map;

/**
 * This class represents the data that's stored in a chess room
 **/
public class ChessRoom {
    //Variables
    private String roomcode;
    private Map <String, String> players = new HashMap<String, String>(2);
    
    //Constructor
    public ChessRoom(String roomcode, String user) {
        this.roomcode = roomcode;
        if(this.players.containsValue("black")){
            this.players.put(user, "white");
        }else{
            this.players.put(user, "black");
        }
    }

    //setters and getters
    public void setCode(String roomcode) {
        this.roomcode = roomcode;
    }

    //Get Code
    public String getCode() {
        return roomcode;
    }

    //Get Users
    public Map<String, String> getUsers() {
        return players;
    }

    /**
     * This method will add the new userID to the room if not exists, or it will add a new userID,name pair
     * **/
    public void setUserName(String userID, String name) {
        // update the name
        if(players.containsKey(userID)){
            players.remove(userID);
            players.put(userID, name);
        }else{ // add new user
            players.put(userID, name);
        }
    }

    //Getter for username
    public String getUserName(String userID){
        return players.get(userID);
    }

    /**
     * This method will remove a user from this room
     * **/
    public void removeUser(String userID){
        if(players.containsKey(userID)){
            players.remove(userID);
        }
    }

    //If in room
    public boolean inRoom(String userID){
        return players.containsKey(userID);
    }
}

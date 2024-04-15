package com.chessproject;

import java.io.IOException;
import java.io.PrintWriter;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/ChessServlet")
public class ChessServlet extends HttpServlet {
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<html><head><title>Chess Game</title></head><body>");
        out.println("<h1>Chess Game</h1>");
        out.println("<script>");
        out.println("let socket = new WebSocket('ws://' + window.location.host + '/ws');");
        out.println("socket.onopen = function(event) { console.log('WebSocket connection opened.'); };");
        out.println("socket.onmessage = function(event) { console.log('Message received: ' + event.data); };");
        out.println("socket.onclose = function(event) { console.log('WebSocket connection closed.'); };");
        out.println("</script>");
        out.println("</body></html>");
    }
}
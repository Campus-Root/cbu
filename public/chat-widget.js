(function () {
    const container = document.body;
    if (!container) return;
  
    const config = {
      position: container.getAttribute("data-position") || "bottom-right",
      apiUrl: container.getAttribute("data-api-url") || "http://localhost:3002/api/chat",
    };
  
    const chatButton = document.createElement("button");
    chatButton.id="chat-button";
    chatButton.style.position="absolute";
    chatButton.style.bottom="10%";
    chatButton.style.right="5%";
    chatButton.style.width="70px";
    chatButton.style.height="70px";
    chatButton.style.borderRadius="1000px";
    chatButton.style.backgroundColor="white";
    chatButton.style.boxShadow="2px 2px 10px black";
    chatButton.innerText = "Chat";
    chatButton.style.zIndex = "9999";
  
    chatButton.addEventListener("click", () => {
      let chatWindow = document.querySelector("#chat-widget-window");
      let closeButton=document.createElement("button");
      closeButton.innerText="Close";
      if (!chatWindow) {
        chatWindow = document.createElement("iframe");
        chatWindow.id = "chat-window";
        chatWindow.src = "http://18.223.170.225:3000/widget/ChatWindow";
        chatWindow.style.width = "400px";
        chatWindow.style.height = "600px";
        chatWindow.style.position="absolute";
        chatWindow.style.bottom="10%";
        chatWindow.style.right="10%";
        chatWindow.style.border = "none";
        chatWindow.style.borderRadius="20px";
        chatWindow.style.backgroundColor="white";
        chatWindow.style.boxShadow="2px 2px 10px black";
        chatWindow.appendChild(closeButton);
        chatWindow.style.zIndex = "10000";
        chatButton.appendChild(chatWindow);
      } else {
        chatWindow.style.display =
          chatWindow.style.display === "none" ? "block" : "none";
      }
    });
  
    container.appendChild(chatButton);
  })();
  
(function () {
  const container = document.body;
  // let key=container.getAttribute("data-api-key");
  const iframe=document.createElement("iframe");
  iframe.id="ChatBot";
  iframe.src="http://18.223.170.225:3000/widget/ChatButton";
  iframe.style.position="absolute";
  iframe.style.bottom="10%";
  iframe.style.right="5%";
  iframe.style.border="none";
  iframe.style.height="750px";
  iframe.style.width="500px";
  iframe.style.zIndex=9999;
  container.appendChild(iframe);
  })();
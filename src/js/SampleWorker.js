function show(data) {
    console.log(data);
    self.postMessage(data[0])
}

self.addEventListener("message", (message) => show(message.data));
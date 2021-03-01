const ipInput = document.getElementById('ip-address');
const connectDiv = document.getElementById('connect');
const statusDiv = document.getElementById('status');
const soulmateData = document.getElementById('soulmate-data');

let socket = null;
const pipe = new MessageChannel();
if (window.opener) {
  window.opener.postMessage({ client: true, port: pipe.port2 }, '*', [pipe.port2]);
} else {
  alert('Warning: not opened from Wokwi! Streaming will not function correctly.');
}

pipe.port1.onmessage = ({ data }) => {
  if (data && data.neopixels && socket && socket.readyState === WebSocket.OPEN) {
    const { neopixels } = data;
    statusDiv.textContent = 'Streaming...';
    const outgoing = new Uint8Array(4 * 14 * 14);
    for (let i = 0; i < neopixels.length / 4; i++) {
      outgoing[i * 4] = 0;
      outgoing[i * 4 + 1] = neopixels[i * 3];
      outgoing[i * 4 + 2] = neopixels[i * 3 + 1];
      outgoing[i * 4 + 3] = neopixels[i * 3 + 2];
    }
    outgoing[0] = 1;
    socket.send(outgoing);
  }
};

function connect() {
  const ipAddress = ipInput.value;
  socket = new WebSocket(`ws://${ipAddress}:81/`);
  connectDiv.classList.add('hidden');
  statusDiv.classList.remove('hidden');
  statusDiv.textContent = 'Connecting...';

  socket.onopen = () => {
    statusDiv.textContent = 'Connected!';

    socket.send(JSON.stringify({ stop: true }));

    socket.onmessage = (e) => {
      soulmateData.textContent = JSON.stringify(JSON.parse(e.data), null, 2);
    };
  };
}


var mic={
    callback:null,
    context:null,
    input:null,
    recorder:null,
    recording:false,
    stream:null
};

function mic_init() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    loaded("mic");
}

function mic_record_stop() {
    mic.recorder.stop();
    mic.recorder.exportWAV(function(blob) {
	var url=URL.createObjectURL(blob);
	mic.callback({
	    url:url
	});
    });
    mic.stream.stop();
    mic.recorder.clear();
}

function mic_record_start(callback) {
    mic.callback=callback;
    mic.context=new AudioContext();
    navigator.getUserMedia({audio: true},function(stream) {
	mic.stream=stream;
	mic.input=mic.context.createMediaStreamSource(mic.stream);
	mic.recorder=new Recorder(mic.input);
	mic.recorder.record();
	mic.recording=true;
    },function(e) {
	console.log("No live audio input: "+e);
    });
}
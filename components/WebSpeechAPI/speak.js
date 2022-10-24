const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
const SpeechGrammarList = window.SpeechGrammarList || webkitSpeechGrammarList;

export const grammar = '#JSGF V1.0;'

export let recognition;

export function start (){
    this.recognition.start()
    console.log('Ready to receive a voice command.');
}

export function esInit() {

    this.recognition = new SpeechRecognition();
    const speechRecognitionList = new SpeechGrammarList();
    speechRecognitionList.addFromString(grammar, 1);
    this.recognition.grammars = speechRecognitionList;
    this.recognition.continuous = false;
    this.recognition.lang = 'en-US';
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
        const color = event.results[0][0].transcript;
        console.log(`Result received: ${color}.`);
        console.log(`Confidence: ${event.results[0][0].confidence}`);
        this.default(color)
    }

    this.recognition.onspeechend = () => {
        console.log('Recognition stopped.');
        this.recognition.stop();
    }

    this.recognition.onnomatch = (event) => {
        console.log('I didnt recognise that color.');
    }

    this.recognition.onerror = (event) => {
        console.log(`Error occurred in recognition: ${event.error}`);
    }
}


export default (output) => {
    return output
}
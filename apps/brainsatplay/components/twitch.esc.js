
export const channel = "brainsatplay"
export const width = '100%'
export const height = 480

export const __element = 'div'
export const __onconnected = function () {

    const script = document.createElement('script')
    script.src = 'https://embed.twitch.tv/embed/v1.js'
    document.body.appendChild(script)

    script.onload = () => {
        new Twitch.Embed(this.__element,{
            width: this.width,
            height: this.height,
            channel: this.channel,
            // // Only needed if this page is going to be embedded on other websites
            // parent: ["embed.example.com", "othersite.example.com"]
        })
    }
}
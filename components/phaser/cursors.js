export function ongame(
    context // a phaser game context
) {
    this.ref = context.input.keyboard.createCursorKeys();
}

export default function() { return this.ref }


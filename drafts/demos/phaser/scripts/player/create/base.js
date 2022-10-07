const getLayer = (name, context) => {
    return context.children.list.find(o => o.type === "TilemapLayer" && o.layer.name === name)
}

function createPlayer(player) {

        // player will collide with the level tiles
        const groundLayer = getLayer('World', this) 
        this.physics.add.collider(groundLayer, player);
    
        const coinLayer = getLayer('Coins', this) 
        this.physics.add.overlap(player, coinLayer);
          
}

export default createPlayer
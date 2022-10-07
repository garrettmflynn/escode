export default function update(context, peers){

      // Check if the this.ref got to the end of the scene, take it back to the origin.
      if (this.ref.x >= 2060 || this.ref.x <= 0)  this.ref.x = 0.5;

      // Allow jumping
      if (peers.cursors.ref.up.isDown) {
        this.jump(true);
      }
      

    // Allow Movement
    if (peers.cursors.ref.left.isDown) {
        this.move(-200);
        this.ref.flipX = true; // flip the sprite to the left
    } else if (peers.cursors.ref.right.isDown) {
        this.move(200);
        this.ref.flipX = false; // use the original sprite looking to the right
    } else {
        this.move(0);
        this.ref.anims.play("idle", true);
    }

    // Toggle Walk Animation
    if (this.ref.body.velocity.x === 0) this.ref.anims.play("walk", false);
    else this.ref.anims.play("walk", true)
    
}